import { createGesture } from '@ionic/vue';
import { ObjectDirective } from 'vue';

// @see https://stackoverflow.com/questions/66567255/prevent-swipe-back-on-ios-ionic-5-vue-app
// @see https://github.com/Sitronik/v-disable-swipe-back
export default <ObjectDirective> {
  beforeMount(el) {
    const gesture = createGesture({
      el,
      threshold: 0,
      gestureName: 'goback-swipe',
      gesturePriority: 40.5,
      onMove: () => console.log()
    });
    gesture.enable(true);
  }
};
