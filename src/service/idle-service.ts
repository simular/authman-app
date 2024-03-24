import lockScreenService from '@/service/lock-screen-service';
import { userStorage } from '@/store/main-store';

export default new class {
  lastActionTime = 0;

  listen(maxIdleMinutes = 5, intervalSecs = 60) {
    setInterval(() => {
      this.checkIdleTimeAndHandle(maxIdleMinutes);
    }, intervalSecs * 1000);

    this.logLastActionTime();

    document.body.addEventListener('click', () => {
      this.logLastActionTime();
    });
  }

  logLastActionTime() {
    this.lastActionTime = Math.round(new Date().getTime() / 1000);
  }

  async checkIdleTimeAndHandle(maxIdleMinutes: number) {
    const now = Math.round(new Date().getTime() / 1000);
    const maxIdleSeconds = maxIdleMinutes * 60;
    const idleTime = now - this.lastActionTime;

    // console.log('idle time', idleTime, '>', maxIdleSeconds, '=', idleTime > maxIdleSeconds);

    if (!userStorage.value) {
      return;
    }

    if (idleTime > maxIdleSeconds) {
      lockScreenService.lock();
    }
  }
}

