import Vue from 'vue';
import Resource from 'vue-resource';
import FileUpload from '../src/fileupload.vue';

Vue.component('fileupload', FileUpload);
Vue.use(Resource);

var demo = new Vue({
    el: "#demo",
    data() {
        return {
            accept: '.xlsx,.xls',
            url: '/upload'
        }
    }
});
