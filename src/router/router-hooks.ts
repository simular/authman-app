import lockScreenService from '@/service/lock-screen-service';

export async function pageInit() {
  console.log('Before');
  await lockScreenService.routerLock();
  console.log('After');
}
