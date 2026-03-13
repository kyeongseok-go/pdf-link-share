export interface Env {
  PAGES_URL: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const url = `${env.PAGES_URL}/api/cron/cleanup`;
    const res = await fetch(url, { method: 'GET' });
    console.log(`cleanup: ${res.status}`);
  },
};
