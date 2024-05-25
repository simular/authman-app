import { Directive } from 'vue';

export default <Directive<HTMLIonInputElement>> {
  async mounted(el, bindings) {
    el.addEventListener('input', onInput);
    el.addEventListener('invalid', onInvalid);

    const input = await el.getInputElement();
    input.addEventListener('invalid', onInputInvalid);
  },

  async unmounted(el) {
    el.removeEventListener('input', onInput);
    el.removeEventListener('invalid', onInvalid);

    const input = await el.getInputElement();
    input.removeEventListener('invalid', onInputInvalid);
  },
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

async function onInputInvalid(e: Event) {
  const input = e.currentTarget as HTMLInputElement;

  const ionInput = input.closest<HTMLIonInputElement>('ion-input');

  if (ionInput) {
    ionInput.dispatchEvent(
      new CustomEvent('invalid')
    );
  }
}
