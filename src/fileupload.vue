<template>
<div class="upload-wrap">
    <label>
        <i v-if="!statcode || statcode==4" class="fa fa-upload"></i>
        {{stat}}
        <input type="file" name="file" :accept="accept" @change="handleFiles" :disabled="statcode==1">
        <div v-if="html5" class="progress" :style="{'width': percent+'%'}"></div>
    </label>
    <em class="error" v-if="statcode == 3">{{errmsg}}</em>
    <em class="success" v-if="statcode == 2">{{filename}} uploaded successfully!</em>
</div>
</template>

<script>
import Vue from 'vue'
import Resource from 'vue-resource'

Vue.use(Resource);

const _START=0, _UPLOADING=1, _SUCCESS=2, _FAILED=3, _REUPLOAD=4;
const stats = ['Choosing a file...', 'Uploading...', 'Success!', 'Failed!', 'Click to re-upload...'];

export default {
    props: {
        accept: String,
        url: String
    },
    data() {
        return {
            statcode: _START,
            filename: '',
            progress: {
                max: 100,
                loaded: 0
            },
            errmsg: ''
        }
    },
    computed: {
        percent() {
            return (this.progress.loaded/this.progress.max).toFixed(4)*100;
        },
        html5() {
            return !!window.FormData;
        },
        stat() {
            return stats[this.statcode];
        }
    },
    methods: {
        reset() { //上传时，重置状态
            this.statcode = _UPLOADING;
            this.progress.max = 100;
            this.progress.loaded = 0;
            this.errmsg = '';
        },
        handleFiles() {
            if(this.statcode == _UPLOADING) return false;
            this.reset();
            if(this.html5){
                //取消表单的默认提交
                if(event.preventDefault) event.preventDefault();
                else event.returnValue = false;
                var form = new FormData();
                var file = event.srcElement.files[0];
                this.filename = file.name;
                form.append(file.name, file);
                this.$http.post(this.url, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    progress: (e) => {
                        if (e.lengthComputable) {
                            this.progress.loaded = e.loaded;
                            this.progress.max = e.total;
                        }
                    }
                }).then(res=>{
                    if(res.status == 200){
                        var data = JSON.stringify(res.data);
                        if(data.errno){
                            this.statcode = _FAILED;
                            this.errmsg = data.errmsg;
                        }else {
                            this.statcode = _SUCCESS;
                            this.successmsg = data.msg;
                        }
                    }else {
                        this.statcode = _FAILED;
                        this.errmsg = 'Upload error...';
                    }
                });
            }else {
                var me = this;
                me.filename = event.srcElement.value.split('/').pop().split('\\').pop();
                var suffix = me.filename.split('.').pop();
                if(me.accept.split(',').indexOf(`.${suffix}`) == -1){
                    me.errmsg = `Accept only ${me.accept} file.`;
                    me.statcode = _FAILED;
                    return false;
                };
                console.log(me.filename);
                var iframe = document.createElement("iframe");
                iframe.width = 0;
                iframe.height = 0;
                iframe.border = 0;
                iframe.name = "upload-iframe";
                iframe.id = "upload-iframe";
                iframe.setAttribute("style", "width:0;height:0;border:none");
                event.srcElement.parentNode.appendChild(iframe);
                var form = document.createElement('form');
                form.setAttribute("method", "POST");
                form.setAttribute("action", me.url);
                form.setAttribute("enctype", "multipart/form-data");
                form.setAttribute("target", "upload-iframe");
                form.setAttribute("encoding", "multipart/form-data");
                iframe.appendChild(form);
                var input = event.srcElement;
                var inputP = event.srcElement.parentNode;
                form.appendChild(event.srcElement);
                iframe.onload = function(){
                    var responseData = this.contentDocument.body.textContent || this.contentWindow.document.body.textContent;
                    var res = JSON.parse(responseData);
                    if(res.errno){
                        me.statcode = _FAILED;
                        me.errmsg = res.errmsg;
                    }else {
                        me.statcode = _SUCCESS;
                        me.successmsg = res.msg;
                    }
                    setTimeout(function(){
                        var _iframe = document.getElementById("upload-iframe");
                        //将input append 回去
                        _iframe.parentNode.appendChild(_iframe.querySelector('form input'))
                        //删掉iframe
                        _iframe.parentNode.removeChild(_iframe);
                    }, 100);
                }
                form.submit();
            }
        }
    }
}

</script>

<style lang="sass" src="./fileupload.scss"></style>
