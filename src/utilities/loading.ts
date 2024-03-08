import { simpleAlert } from '@/utilities/alert';
import { loadingController, LoadingOptions } from '@ionic/vue';
import { ref, Ref } from 'vue';

export default function useLoading(loading?: Ref<boolean>) {
  loading = loading || ref(false);

  const run = async function <T>(callback: () => Promise<T>): Promise<T> {
    loading!.value = true;

    try {
      return await callback();
    } catch (e: any) {
      console.error(e);
      simpleAlert(e?.message || 'Unknown Error', '');
      throw e;
    } finally {
      loading!.value = false;
    }
  }

  return { loading, run };
}

export async function useLoadingOverlay(message: string, options: LoadingOptions = {}) {
  const loading = ref(false);
  const loadingCtrl = await showLoadingOverlay(message, options);

  const run = async function <T>(callback: () => Promise<T>): Promise<T> {
    loading!.value = true;
    await loadingCtrl.present();

    try {
      return await callback();
    } catch (e: any) {
      console.error(e);
      simpleAlert(e?.message || 'Unknown Error', '');
      throw e;
    } finally {
      loadingCtrl.dismiss();
      loading!.value = false;
    }
  }

  return { loading, loadingCtrl, run };
}

export async function showLoadingOverlay(message: string, options: LoadingOptions = {}): Promise<HTMLIonLoadingElement> {
  const loading: HTMLIonLoadingElement = await loadingController.create({
    message: message,
    showBackdrop: true,
    duration: 5000,
    ...options
  });

  await loading.present();

  return loading;
}
