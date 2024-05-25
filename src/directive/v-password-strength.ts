import { Directive, ObjectDirective } from 'vue';
import zxcvbn from 'zxcvbn';

export default <Directive<HTMLIonInputElement>> {
  mounted(el, bindings) {
    el.addEventListener('input', onInput);
  },

  unmounted(el) {
    el.removeEventListener('input', onInput);
  }
}

async function onInput(e: Event) {
  if (import.meta.env.VITE_CHECK_PASSWORD_STRENGTH !== '1') {
    return;
  }

  const el = e.currentTarget as HTMLIonInputElement;
  const result = zxcvbn(el.value as string);

  el.classList.add('ion-touched');
  el.classList.remove('ion-invalid');

  if (result.score < 3) {
    el.classList.add('ion-invalid');
    el.errorText = result.feedback.suggestions.join(' ');
  } else {
    el.classList.add('ion-valid');
    el.errorText = '';
  }

  const input = await el.getInputElement();
  input.setCustomValidity(el.errorText);
}
