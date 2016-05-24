$(document).ready(function () {
    $('.duplicate').each(function (index, element) {
        var obj = $(element);

        obj.find('input[type=text]').focus(function () {
            duplicate(obj);
        });
    });
});

function duplicate(element) {
    var obj = $(element);

    if (obj.next('.duplicate').length > 0)
        return;

    var clone = obj.clone(false);
    obj.after(clone);

    clone.find('input[type=text]').val('').focus(function () {
        duplicate(clone);
    });

    return clone;
}

function removeDuplicate(element) {
    if ($('.duplicate').length === 1)
        return;

    var duplicate = $(element).closest('.duplicate');
    duplicate.remove();
}

function parseIngredientPase() {
    var ingredients = $('#ingredientPaste').val().replace(/[\r\n]/g, ",").replace(/(?:\s*,\s*)/g, ",").split(',');

    if( ingredients.length === 0 ) {
        return;
    }

    $('.nav-tabs a[href="#list"]').tab('show');

    $(".duplicate:gt(0)").remove();

    var currentRow;

    for (var index in ingredients) {
        var ingredient = ingredients[index];
        if( ingredient === null || ingredient === '')
            continue;
        else if( currentRow === null || currentRow === undefined )
            currentRow = $(".duplicate");
        else
            currentRow = duplicate(currentRow);
        currentRow.find('input[type=text]').val(ingredient);
    }
}