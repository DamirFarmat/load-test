const { exec } = require('child_process');
const iconv = require('iconv-lite'); // Импортируем iconv-lite

class MonitoringController {
    async monitor(req, res, next) {
        const { target, type } = req.body;

        if (!target || !type) {
            return res.status(400).json({ error: "Не указан target или type" });
        }

        const isWindows = process.platform === 'win32';
        
        const getPingCommand = (target) => 
            isWindows 
                ? `ping -n 1 ${target}` 
                : `ping -c 1 ${target}`;
        
        const getCurlCommand = (target) => 
            isWindows 
                ? `curl -I ${target}` 
                : `curl -o /dev/null -s -w "%{time_total}" ${target}`;

        const parsePingOutput = (output, isWindows) => {
            if (isWindows) {
                const match = output.match(/время[=<](\d+)мс/);
                return match ? match[1] : null;
            } else {
                const match = output.match(/time=(\d+\.?\d*) ms/);
                return match ? match[1] : null;
            }
        };

        const command = type === "L4"
            ? getPingCommand(target)
            : getCurlCommand(target);

        exec(command, { encoding: 'buffer' }, (error, stdout, stderr) => {
            const decodedStdout = iconv.decode(stdout, isWindows ? 'cp866' : 'utf8');
            const decodedStderr = iconv.decode(stderr, isWindows ? 'cp866' : 'utf8');

            let responseTime;
            if (type === "L4") {
                responseTime = parsePingOutput(decodedStdout, isWindows);
                if (error && responseTime) {
                    return res.json({ target, responseTime: parseFloat(responseTime) });
                }
                if (error && !responseTime) {
                    return res.json({ target, responseTime: null, error: "Host unreachable" });
                }
                if (!responseTime) {
                    return res.json({ target, responseTime: null, error: "Host unreachable" });
                }
            } else {
                responseTime = decodedStdout.trim();
                if (error) {
                    return res.status(500).json({ error: decodedStderr || error.message });
                }
            }

            res.json({ target, responseTime: parseFloat(responseTime) });
        });
    }
}

module.exports = new MonitoringController();