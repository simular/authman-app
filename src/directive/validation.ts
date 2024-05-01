import { Directive } from 'vue';

export default <Directive<HTMLIonInputElement>> {
  async mounted(el, bindings) {
    el.addEventListener('input', onInput);
    el.addEventListener('invalid', onInvalid);
  },

  async unmounted(el) {
    el.removeEventListener('input', onInput);
    el.removeEventListener('invalid', onInvalid);
  }
}

function onInput(e: Event) {
  const el = e.currentTarget as HTMLIonInputElement;

  el.classList.add('ion-touched');
  el.classList.remove('ion-invalid');
  el.classList.remove('ion-valid');
  el.errorText = '';
}

async function onInvalid(e: Event) {
  const el = e.currentTarget as HTMLIonInputElement;
  const input = await el.getInputElement();

  el.classList.add('ion-touched');

  setTimeout(() => {
    el.classList.add('ion-invalid');
    el.errorText = input.validationMessage;
  });
}
