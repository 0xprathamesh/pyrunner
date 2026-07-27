const Docker = require('dockerode');
const { Writable } = require('stream');

const docker = new Docker({
  socketPath: process.env.DOCKER_SOCK || '/var/run/docker.sock',
});

const PYTHON_IMAGE = process.env.PYTHON_IMAGE || 'python:3.12-alpine';
const MAX_EXECUTION_MS = Number(process.env.MAX_EXECUTION_MS || 5000);
const MAX_MEMORY_MB = Number(process.env.MAX_MEMORY_MB || 128);
const MAX_OUTPUT_BYTES = Number(process.env.MAX_OUTPUT_BYTES || 65536);

function truncate(text, limit) {
  if (Buffer.byteLength(text, 'utf8') <= limit) return text;
  return `${Buffer.from(text, 'utf8').subarray(0, limit).toString('utf8')}\n...[truncated]`;
}

function createCollector(limit) {
  const chunks = [];
  let size = 0;

  const stream = new Writable({
    write(chunk, _enc, cb) {
      if (size < limit) {
        const slice =
          size + chunk.length > limit ? chunk.subarray(0, limit - size) : chunk;
        chunks.push(Buffer.from(slice));
        size += slice.length;
      }
      cb();
    },
  });

  return {
    stream,
    text: () => truncate(Buffer.concat(chunks).toString('utf8'), limit),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


function buildScript(sourceCode, stdin) {
  return [
    'import sys',
    'from io import StringIO',
    `sys.stdin = StringIO(${JSON.stringify(stdin ?? '')})`,
    sourceCode,
  ].join('\n');
}


async function executePython({ sourceCode, stdin = '' }) {
  const started = Date.now();
  let container;

  try {
    container = await docker.createContainer({
      Image: PYTHON_IMAGE,
      Cmd: ['python', '-u', '-c', buildScript(sourceCode, stdin)],
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      NetworkDisabled: true,
      HostConfig: {
        Memory: MAX_MEMORY_MB * 1024 * 1024,
        MemorySwap: MAX_MEMORY_MB * 1024 * 1024,
        NanoCpus: 1e9,
        PidsLimit: 64,
        AutoRemove: false,
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges'],
      },
      WorkingDir: '/tmp',
      User: 'nobody',
    });

    const stdout = createCollector(MAX_OUTPUT_BYTES);
    const stderr = createCollector(MAX_OUTPUT_BYTES);

    const attachStream = await container.attach({
      stream: true,
      stdin: false,
      stdout: true,
      stderr: true,
    });

    container.modem.demuxStream(attachStream, stdout.stream, stderr.stream);

    await container.start();

    let timedOut = false;
    const waitPromise = container.wait();
    const timeoutId = setTimeout(async () => {
      timedOut = true;
      try {
        await container.kill({ signal: 'SIGKILL' });
      } catch {
        // ignore
      }
    }, MAX_EXECUTION_MS);

    let waitResult;
    try {
      waitResult = await waitPromise;
    } finally {
      clearTimeout(timeoutId);
    }

    await sleep(50);
    try {
      attachStream.destroy();
    } catch {
      // ignore
    }

    if (timedOut) {
      return {
        status: 'time_limit_exceeded',
        stdout: stdout.text(),
        stderr: stderr.text(),
        exitCode: null,
        timeMs: Date.now() - started,
        memoryKb: null,
        errorMessage: `Execution exceeded ${MAX_EXECUTION_MS}ms`,
      };
    }

    const exitCode = waitResult.StatusCode;
    return {
      status: exitCode === 0 ? 'accepted' : 'runtime_error',
      stdout: stdout.text(),
      stderr: stderr.text(),
      exitCode,
      timeMs: Date.now() - started,
      memoryKb: null,
      errorMessage: null,
    };
  } catch (err) {
    if (err.statusCode === 404 || /No such image/i.test(err.message || '')) {
      return {
        status: 'internal_error',
        stdout: '',
        stderr: '',
        exitCode: null,
        timeMs: Date.now() - started,
        memoryKb: null,
        errorMessage: `Python image not found. Pull it first: docker pull ${PYTHON_IMAGE}`,
      };
    }

    return {
      status: 'internal_error',
      stdout: '',
      stderr: '',
      exitCode: null,
      timeMs: Date.now() - started,
      memoryKb: null,
      errorMessage: err.message || 'Execution failed',
    };
  } finally {
    if (container) {
      try {
        await container.remove({ force: true });
      } catch {
        // already gone
      }
    }
  }
}

async function ensurePythonImage() {
  try {
    await docker.getImage(PYTHON_IMAGE).inspect();
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  executePython,
  ensurePythonImage,
  PYTHON_IMAGE,
};
