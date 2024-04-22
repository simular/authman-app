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

function onInput(e: Event) {
  const el = e.currentTarget as HTMLIonInputElement;
  const result = zxcvbn(el.value as string);

  el.classList.add('ion-touched');
  el.classList.remove('ion-invalid');

  if (result.score < 3) {
    el.classList.add('ion-invalid');
  } else {
    el.classList.add('ion-valid');
  }

  el.errorText = result.feedback.suggestions.join(' ');
}
