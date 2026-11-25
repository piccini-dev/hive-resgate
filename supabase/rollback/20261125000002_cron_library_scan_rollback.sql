-- Desliga a varredura automática da Biblioteca. As descobertas já gravadas ficam.
SELECT cron.unschedule('library-scan') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'library-scan');
