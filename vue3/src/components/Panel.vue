<template>
    <div id="panel" class="transition trans-left trans-right" :class="{show: store.isShowPanel}">
        <div class="container border">
            <button id="closePanel" @click="store.closePanel()" class="position-right p-2"><i class="fas fa-arrow-alt-circle-right"></i></button>

            <h1 class="panel-heading m-2">RECORDS</h1>

            <button id="showSettings" @click="store.toggleSettings()" class="toggleSettings p-2" :class="{'d-none': !store.isShowSettingsBtn}"><i class="fas fa-tools"></i></button>

            <div class="panel-body px-2">
                <div class="settings transition trans-height mb-2 height-0 color-secondary" :class="{show: store.isShowSettings}">
                    <button @click="store.isShowSettings = false" id="hideSettings" class="toggleSettings p-1 font-4 float-right"><i class="fas fa-times close"></i></button>
                    <h4 class="heading m-1 color-white">SETTINGS</h4>
                    <span>Create new record</span>
                    <div class="add-record d-flex mb-2">
                        <input type="text" v-model="newTitle" id="add-record-input" class="py-1 pl-1 mr-1" :placeholder="placeholder">
                        <button id="add-record-btn" class="pt-1" @click="createRecord"><i class="fas fa-plus-square"></i></button>
                    </div>
                    <label id="chkDelayRefresh" class="color-white">
                        <i class="unchecked far fa-square mr-1 color-grey" :class="{'d-none': store.settings.delayRefresh}"></i>
                        <i class="checked far fa-check-square mr-1 color-primary" :class="{'d-none': !store.settings.delayRefresh}"></i><small>Delay refresh counters</small>
                    </label>
                </div>

                <RecordList />

                <div class="login-buttons-container" :class="{'d-none': store.isLoggedIn}">
                    <div class="">
                        <button id="signin-google" data-signin-type="google" class="signin font-4 btn btn-block border-0 mt-3 p-0 p-2 d-flex align-items-center">
                            <img src="@/assets/img/google-favico.png" class="px-3"> Signin with Google
                        </button>
                        <button id="signin-facebook" data-signin-type="facebook" class="signin font-4 btn btn-block color-white border-0 mt-3 p-0 p-2 d-flex align-items-center">
                            <img src="@/assets/img/facebook-favico.png" class="px-3"> Signin with Facebook
                        </button>
                    </div>
                </div>

                <button id="showPrayers" class="btn btn-block color-white mt-3 p-0 d-flex align-items-center justify-content-center">
                    <img src="@/assets/img/ico-muslimpro.png" class="pr-3"> Prayers
                </button>

                <button id="logoutBtn" class="btn btn-block mt-3 bg-grey color-grey" :class="{'d-none': !store.isLoggedIn}">
                    <i class="fas fa-user-lock mr-2"></i>Logout
                </button>
            </div>
            <div class="panel-footer p-2 mt-2">
                <h3>What is this app for?</h3>
                <p style="text-align: justify;">Many people have need to count (words, items, maraton runners) among other things that go fast. Other people have tasks to count the accuracy of specific items on a production line. Another synario is religious people who set them selves a goal to say "precious words" for thousands of times, which is too hard to focus on. Also in sports, referees can use this app to count shots, fouls, passes and so on. Therefor, this app can help users do their "counting tasks" easily and achieve their goals.</p>
                <h3>Features</h3>
                <ul class="pr-0 pl-3" style="text-align: left;">
                    <li>Add more records to count multi-tasks separately</li>
                    <li>Set a goad for each record and monitor how far you have come on the left-bar</li>
                    <li>Logs for each records individually, today, week, total. (more coming)</li>
                    <li>Charts for each records individually</li>
                    <li>General yellow counter that can be reset, in the center of the top</li>
                    <li>The records are saved locally in the browser, and you can LOGIN to sync them on the cloud to save your data and use on other devices</li>
                </ul>
                <h3>Notice</h3>
                <p style="text-align: justify;">Browser compatibility is being optimized all the time. But the main functions are working fine and tested.</p>
                <h3 class="mt-3 mb-1">Contact:</h3>
                <p class="">Muhannad Senan</p>
                <p class="">msn-23@live.com</p>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { store } from '@/store'
    import { Record, Logbook, Log } from '@/assets/Classes.js'
    import RecordList from './RecordList.vue'

    const newTitle = ref('')
    const placeholder = ref('Enter title...')

    function createRecord(){
        if(newTitle.value.trim().length === 0){
            recordPlaceholder.value = 'Empty title entered!';
        }
        else{
            // pulse($(this), 1);
            const newRecord = new Record(incrementID(), $input.val());
            store.records.unshift(newRecord);
            store.history.logBooks.push(
                new Logbook(newRecord.id,
                    new Log(
                        new Date().toLocaleString("en"), newRecord.counter
                    )
                )
            );
            store.save();
            newTitle.value = '';
            toggleSettings();
            store.doSelectRecord(newRecord.id);
            store.fillSelectedRecord();
            store.selectedIndex = store.records.length - 1
            // pulse($panel.find('.record').first(), 1);
        }
        // pulse($input);
        // pulse($(this), 1);
        // $input.focus();
    }

    function toggleSettings(){
		store.isShowSettings = true;
		// $panel.find('#add-record-input').focus();
		// pulse($('#showSettings'), 2);
	}

    function incrementID(arr, idProp){
        if(arr === undefined) arr = store.records;
        if(idProp === undefined) idProp = 'id';
        return Math.max.apply(Math, arr.map(function(el){ return el[idProp]; })) + 1;
    }

</script>
