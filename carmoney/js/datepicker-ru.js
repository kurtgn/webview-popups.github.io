/* Russian (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* Written by Andrew Stromnov (stromnov@gmail.com). */
( function( factory ) {
    if ( typeof define === "function" && define.amd ) {

        // AMD. Register as an anonymous module.
       // define( [ "../widgets/datepicker" ], factory );
    } else {

        // Browser globals
        factory( jQuery.datepicker );
    }
}( function( datepicker ) {
    var date = new Date(),
        day = date.getDate(),
        month = date.getMonth(),
        year = date.getFullYear();
    var month2 = '';
    switch (month) {
        case 0:
            month2 = 'января';
            break;
        case 1:
            month2 = 'февраля';
            break;
        case 2:
            month2 = 'марта';
            break;
        case 3:
            month2 = 'апреля';
            break;
        case 4:
            month2 = 'мая';
            break;
        case 5:
            month2 = 'июня';
            break;
        case 6:
            month2 = 'июля';
            break;
        case 7:
            month2 = 'августа';
            break;
        case 8:
            month2 = 'сентября';
            break;
        case 9:
            month2 = 'октября';
            break;
        case 10:
            month2 = 'ноября';
            break;
        case 11:
            month2 = 'декабря';
            break;
    }
    var today = " "+day+" "+month2+", "+year;

    datepicker.regional.ru = {
        closeText: "Закрыть",
        prevText: "&#x3C;Пред",
        nextText: "След&#x3E;",
        currentText: "Сегодня <span>"+today+"</span>",
        monthNames: [ "Январь","Февраль","Март","Апрель","Май","Июнь",
            "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ],
        monthNamesShort: [ "Января","Февраля","Марта","Апреля","Майя","Июня",
            "Июля","Августа","Сентября","Октября","Ноябяря","Декабря" ],
        dayNames: [ "воскресенье","понедельник","вторник","среда","четверг","пятница","суббота" ],
        dayNamesShort: [ "вск","пнд","втр","срд","чтв","птн","сбт" ],
        dayNamesMin: [ "Вс","Пн","Вт","Ср","Чт","Пт","Сб" ],
        weekHeader: "Нед",
        dateFormat: "d M, yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: "" };
    datepicker.setDefaults( datepicker.regional.ru );

    return datepicker.regional.ru;

} ) );