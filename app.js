var counter, total, currentCounter, $total, $progress, $counter, $today, $panel, STORE, selectedRecord, selectedIndex, activeChanged, cookieOptions, $templates;

function init() {
    initValues();
    if( selectedRecord === undefined){
        setProgress(0);
    }else{
        setProgress(selectedRecord.counter);
    }
    $('body').on('click', function(e) {e.stopPropagation();});
    $('#clicker').on('click', increaseCounter);
    $('#reset').on('click', reset);
    $('#showPanel').on('click', onShowPanel);
    $('#closePanel').on('click', onClosePanel);
    $('#add-record-btn').on('click', createRecord);
    $('button.details').on('click', toggleDropdown);
    $('.record-body').on('click', toggleActivate);
    $('.changeTitle').on('click', changeTitle);
    $('.deleteRecord').on('click', deleteRecord);
    $('#showPrayers').on('click', showPrayers);
    $('#showAddRecord, #hideAddRecord').on('click', toggleAddRecord);
    $('.showChart').on('click', showChart);
    $('.chart-panel .close').on('click', closeChartpanel);
    // pulseAll();
    $('body').addClass('animated');
}

function initValues(){
    counter = 0;
    cookieOptions = {expires: 3650};
    $total = $("#total");
    $progress = $("#progress");
    $counter = $("#counter");
    $today = $("#today");
    $title = $("#recordTitle");
    $panel = $('#panel');
    $templates = $('#templates');
    
    STORE = Cookies.getJSON();
    if(STORE.history === undefined) {// All histories of records
        STORE.history = new History();
    }
    if(STORE.selectedIndex === undefined) {
        STORE.selectedIndex = 0;
    }
    if(STORE.records === undefined) {
        var title = prompt("No records yet. Create one !", 'أستغفر الله');
        if(title.trim() == '')
            title = '';
        var newRec = new Record(1, title);
        STORE.records = [newRec];
        STORE.selectedIndex = 0;
        selectedRecord = newRec;
        selectedIndex = 0;
    }
    /* insure that every record has Logbook */
    $.each(STORE.records, function(i, rec){
        if(!STORE.history.all.some(el => el.recordId == rec.id)){
            console.log("Generaing daily Log for record ("+rec.title+")");
            STORE.history.all.push(new Logbook(rec.id));
        }
    });

        // Cookies.remove('history', { path: '' }) // removed!
        // alert(JSON.stringify(STORE.history.lastWriting))

    selectedIndex = STORE.selectedIndex;
    selectedRecord = STORE.records[selectedIndex];
    if(selectedRecord == null || selectedRecord === undefined) selectedRecord = STORE.records[0];
    activeChanged = false; // must be after fillSelectedRecord()    
    saveSTORE("logging");
    fillSelectedRecord();
}

function fillSelectedRecord(){
    if(selectedRecord.counterLog === undefined) selectedRecord.counterLog = 0;
    $title.text(selectedRecord.title);
    $counter.text(selectedRecord.counter);
    $today.text(selectedRecord.counterLog);
    $total.text(selectedRecord.total);
    setProgress(selectedRecord.counter);
    saveSTORE();
    activeChanged = true;
}

function selectRecord(recID){
    if(recID === undefined){
        selectedIndex = 0;
        selectedRecord = STORE.records[0];
        return;
    }
    STORE.records.forEach((rec, i) => {
        if(rec.id == recID){
            selectedIndex = i;
            selectedRecord = rec;
        }
    });
}

function increaseCounter(){
    selectedRecord.counter++; 
    selectedRecord.total++;
    selectedRecord.counterLog++;
    var refreshCounter = selectedRecord.counter % 10 == 0;
    var today = selectedRecord.counterLog % 10 == 0 ? selectedRecord.counterLog : undefined;
    setProgress(selectedRecord.counter, refreshCounter, today);
    saveSelectedRecord();
    if(selectedRecord.counter % 100 == 0){
        pulse($counter, 1);
    }
    if(selectedRecord.counterLog % 100 == 0){
        pulse($today, 2);
    }
    if(selectedRecord.total % 100 == 0){
        $total.text(selectedRecord.total);
        pulse($total, 1);
    }
}

function setProgress(counter, refreshCounter, today){
    if(refreshCounter === undefined) refreshCounter = true;
    if(today === undefined) today = -1;
    if(refreshCounter){
        $counter.text(counter); 
    }
    if(today != -1){
        $today.text(today); 
    }
    $progress.find('.val').attr('class', 'val c-'+(counter%100));
    pulse($progress);
}

function reset(){
    selectedRecord.counter = 0; 
    setProgress(0);
    saveSelectedRecord();
}

function togglePannel(){
    $panel.toggleClass('show');
}

function onShowPanel(){
    pulse($('#showPanel, #closePanel'), 2);
    togglePannel();
    showRecords();    
}

function onClosePanel(){
    pulse($('#showPanel, #closePanel'), 2);
    if(activeChanged){
        pulseAll();
        activeChanged = false;
    }
    togglePannel();
}

function showRecords(){
    $panel.find('.record').remove();
    STORE.records.forEach(record => {
        addRecordToPanel(record);
        if($('#chart-panel-'+record.id).length == 0){
            createChartPanel(record);
        }
    });
}

function addRecordToPanel(record){
    console.log(record); 
    var tpl = $templates.find('.record-tpl').clone(true);
    tpl.attr('id', 'record-'+record.id).attr('data-id', record.id).attr('data-title', record.title);
    tpl.removeClass('d-none record-tpl').addClass('record').toggleClass('color-primary active', selectedRecord.id == record.id);
    tpl.find('.title').text(record.title);
    tpl.find('.counter').text(record.counter);
    tpl.find('.today').text((record.counterLog || 0) + ' today');
    tpl.find('.total').text('TOTAL ' + record.total);
    tpl.prependTo( $panel.find('.records') );
}

function createChartPanel(record){
    var chartPanel = $templates.find('.chart-panel').clone(true);
    chartPanel.attr('id', 'chart-panel-'+record.id);
    chartPanel.find('.title').text(record.title);
    chartPanel.appendTo('body');
}

function createRecord(){
    var $input = $('#add-record-input');
    if($input.val().length == 0){
        $input.attr('placeholder', 'Empty title entered!');
    }
    else{
        pulse($(this), 1);
        var newRecord = new Record(newID(), $input.val());
        STORE.records.push(newRecord);
        addRecordToPanel(newRecord, STORE.records.length-1);
        saveSTORE("all", newRecord); // records + history but not logging
        $input.val('');
        pulse($panel.find('.record').first(), 1);
        createChartPanel(newRecord);
    }
    pulse($input);
    pulse($(this), 1);
    $input.focus();
}

function saveSelectedRecord(){
    STORE.records[selectedIndex] = selectedRecord;
    saveSTORE();
}

function saveSTORE(toSave, record){
    if(toSave === undefined || toSave == "records" || toSave == "all"){
        Cookies.set("records", STORE.records, cookieOptions);
        console.log("Records saved!");
    }
    if(toSave == "history" || toSave == "all"){
        STORE.history.all.push(new Logbook(record.id, new Log(Date.now(), record.counter)));
        Cookies.set("history", STORE.history, cookieOptions);
        console.log("LogBook created!"); 
    }
    else if(toSave == "logging"){// logging
        var today = new Date();
        var lastWriting = new Date(Date.parse(STORE.history.lastWriting));
        if(lastWriting.getDate() != today.getDate() || lastWriting.getMonth() != today.getMonth() || lastWriting.getFullYear() != today.getFullYear()){
            STORE.history.lastWriting = today.toLocaleString("en"); // timestamp
            console.log("History is lastWritten today", today.toLocaleString("en"));
            $.each(STORE.records, function(i, rec){
                $.each(STORE.history.all, function(j, logBook){
                    if(rec.id == logBook.recordId){
                        var yesterday = new Date();
                        yesterday.setDate(yesterday.getDate()-1);
                        logBook.logs.push(new Log(yesterday.toLocaleString("en")/* timestamp */, rec.counterLog)); // save the daily every time you save
                        rec.counterLog = 0;
                    }
                });
            });
            Cookies.set("history", STORE.history, cookieOptions);
            console.log("Logging saved!");
        }
    }
    console.log("COOKIE STORE", STORE);
}

function toggleDropdown(){
    var $this = $(this);
    $this.closest('.record').toggleClass('showDropdown');
}

function toggleActivate(){
    $('.record').removeClass('color-primary active');
    var $rec = $(this).closest('.record');
    $rec.addClass('color-primary active');
    // var index = recIndexByID($rec.attr('data-id')); // HERE YOU CANNOT CHANGE TO SELECTEDINDEX, BCZ YOU WILL NEED TO GRAB THE INDEX FROM THE RECORD AFTERWARDS
    selectRecord($rec.attr('data-id'));
    fillSelectedRecord();
    pulse($rec);
}

function recIndexByID(id){
    return STORE.records.findIndex(el => el.id == id);
}

function changeTitle(){
    var $rec = $(this).closest('.record');
    var newTitle = prompt("New title:", $rec.attr('data-title'));
    while(newTitle.trim() == '' || newTitle == null){
        alert('You cannot enter an empty title!');
        newTitle = prompt("New title:", $rec.attr('data-title'));
    }
    var index = recIndexByID($rec.attr('data-id'));
    STORE.records[index].title = newTitle;
    setRecordTitle($rec.attr('data-id'), newTitle); // DOM
    saveSTORE();
}

function deleteRecord(){
    var $rec = $(this).closest('.record');
    if($('.record').length == 1){
        alert("Delete aborted. It is the only record you have..");
    }
    else if(confirm('Are you sure to delete "' + $rec.attr('data-title') + '"?')){
        STORE.records = STORE.records.filter(el => el.id != $rec.attr('data-id'));
        $('#record-'+$rec.attr('data-id')).remove();
        if($rec.attr('data-id') == selectedRecord.id){
            selectRecord();
            fillSelectedRecord();
            return;
        }
        saveSTORE();
    }
}

function setRecordTitle(id, newTitle){ // DOM only
    $('#record-'+id).find('.title').text(newTitle);
    if(id == selectedRecord.id){
        $('#recordTitle').text(newTitle);
    }
}

function pulse($element, i){
    if(i === undefined) i = 0;
    var types = ['pulse', 'pulseText', 'pulseTextLong', 'pulseLong'];
    $element.removeClass(types);
    $element.width();
    $element.addClass(types[i]);
}

function pulseAll(){
    pulse($progress, 3);
    pulse($counter, 2);
    pulse($today, 2);
    pulse($title, 2);
    pulse($total, 2);
}

function showPrayers(){
    window.location = "./prayers.html";
}

function toggleAddRecord(){
    $panel.toggleClass('showAddRecord');
    $panel.find('#showAddRecord').toggleClass('d-none');
    $panel.find('#hideAddRecord').toggleClass('d-none');
    $panel.find('#add-record-input').focus();
    pulse($('#showAddRecord, #hideAddRecord'), 2);
}

function uniqID(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function showChart(e){
    var id = $(this).closest('.record').attr('data-id');
    var chartPanel = $('#chart-panel-'+id);
    chartPanel.toggleClass('show');
    chartPanel.find('.loading').addClass('d-flex').removeClass('d-none');
    chartPanel.find('.container').addClass('hide');
    drawChart(chartPanel.find('canvas'), id);
    chartPanel.find('.loading').removeClass('d-flex').addClass('d-none');
    chartPanel.find('.container').removeClass('hide');
}

function closeChartpanel(){
    $(this).closest('.chart-panel').removeClass('show');
}

function drawChart(element, recID){
    var labels = [], data = [];
    var logBook = STORE.history.all.find(el => el.recordId == recID);
    console.log("drawing chart: ");
    var index = 0;
    if(logBook.logs.length >= 30){
        index = logBook.logs.length - 30;
    }
    logBook.logs.splice(index).forEach((el, i) => {//console.log(i, el);
        var d = new Date(Date.parse(el.date));
        labels.push(d.getDate()+'/'+(d.getMonth()+1));
        data.push(el.value);
    }); //console.log("labels", labels, "data", data);
    var myChart = new Chart(element, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Votes',
                data: data,
                backgroundColor: '#919877',
                borderColor: '#c6ff00',
                lineTension: .2,
                borderWidth: '10',
                pointBorderColor: 'blue',
                pointBackgroundColor: 'blue',
                pointHitRadius: '50',
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontSize: '50'
                    },
                    gridLines: {
                        display: true,
                        color: '#777',
                        lineWidth: '2',
                        z: '1'
                    },
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontSize: '50'
                    },
                    gridLines: {
                        display: true,
                        color: '#777',
                        lineWidth: '2',
                        z: '1'
                    },
                }],
            },
            // responsive: true,
            // responsiveAnimationDuration: 2000,
            maintainAspectRatio: false
        }
    });
    Chart.defaults.global.defaultFontFamily = 'Lalezar';
    Chart.defaults.global.defaultFontColor = '#c6ff00';
}

function newID(arr, idProp){
    if(arr === undefined) arr = STORE.records;
    if(idProp === undefined) idProp = 'id';
    return arr[arr.length-1][idProp] + 1;
}

window.onload = init();