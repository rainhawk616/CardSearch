module.exports = {
    formatDate: function (date) {
        if (date === null || date === undefined)
            return "";
        else
            var month = (date.getMonth() + 1);
        if (month < 10)
            month = '0' + month;
        var day = date.getDate();
        if (day < 10)
            day = '0' + day;
        var year = date.getFullYear();

        return month + "/" + day + "/" + year;
    },
    magicify: function (string) {
        if( string === null || string == undefined || string === '' || string.indexOf('{') === -1)
            return string;
        return string.replace(/{(\w)}/g, function (fullReplace, capture) {
            return '<div class="ms ms-cost ms-' + capture.toLowerCase() + ' "></div>';
        });
    }
};