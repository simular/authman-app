import { alertController, toastController, ToastOptions } from '@ionic/vue';

export async function simpleAlert(title: any, text?: string, type = 'warning'): Promise<void> {
  if (title instanceof Error || title.message) {
    title = title.message;
  }

  return new Promise((resolve) => {
    const alert = alertController
      .create({
        // cssClass: 'my-custom-class',
        header: title,
        // subHeader: 'Subtitle',
        message: text,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              resolve();
            },
          },
        ],
      });

    alert.then((alert) => alert.present());
  });
}

export async function simpleConfirm(title: string, text?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const alert = alertController
      .create({
        // cssClass: 'my-custom-class',
        header: title,
        // subHeader: 'Subtitle',
        message: text,
        buttons: [
          {
            text: '取消',
            handler: () => {
              resolve(false);
            },
          },
          {
            text: '確定',
            handler: () => {
              resolve(true);
            },
          },
        ],
      });

    alert.then((alert) => alert.present());
  });
}

export async function simpleToast(
  message: string,
  position: 'top' | 'bottom' | 'middle' = 'bottom',
  duration = 1000,
  options: ToastOptions = {}
) {
  const toast = await toastController.create({
    ...options,
    message,
    position,
    duration
  });

  return toast.present();
}
