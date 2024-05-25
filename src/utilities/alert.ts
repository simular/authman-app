import {
  actionSheetController,
  ActionSheetOptions,
  alertController,
  toastController,
  ToastOptions,
} from '@ionic/vue';

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
            text: 'Cancel',
            handler: () => {
              resolve(false);
            },
          },
          {
            text: 'OK',
            handler: () => {
              resolve(true);
            },
          },
        ],
      });

    alert.then((alert) => alert.present());
  });
}

export async function simpleActionSheetConfirm(
  title: string,
  buttons: string[] = [],
  options: Partial<ActionSheetOptions> = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    const alert = actionSheetController
      .create({
        // cssClass: 'my-custom-class',
        header: title,
        buttons: [
          {
            text: buttons[0] || 'OK',
            role: 'destructive',
            handler: () => {
              resolve(true);
            },
          },
          {
            text: buttons[1] || 'Cancel',
            role: 'cancel',
            handler: () => {
              resolve(false);
            },
          },
        ],
        ...options
      });

    alert.then((alert) => alert.present());
  });
}

export async function simpleToast(
  message: string,
  position: 'top' | 'bottom' | 'middle' = 'bottom',
  duration = 1000,
  options: ToastOptions = {},
) {
  const toast = await toastController.create({
    ...options,
    message,
    position,
    duration,
    swipeGesture: 'vertical',
  });

  return toast.present();
}
