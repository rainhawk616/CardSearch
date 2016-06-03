function back() {
    window.history.back();
}

$(document).ready(function () {
    $(".clickable").click(function() {
        window.document.location = $(this).data("href");
    });
});