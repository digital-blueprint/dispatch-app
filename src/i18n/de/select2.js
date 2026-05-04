/**
 * Content from https://github.com/select2/select2/blob/master/src/js/select2/i18n/de.js
 */
export default function () {
    // German
    return {
        errorLoading: function () {
            return 'Die Ergebnisse konnten nicht geladen werden.';
        },
        inputTooLong: function (args) {
            var overChars = args.input.length - args.maximum;

            return 'Bitte ' + overChars + ' Zeichen weniger eingeben';
        },
        inputTooShort: function (args) {
            var remainingChars = args.minimum - args.input.length;

            return (
                ' Geben Sie mindestens ' +
                remainingChars +
                ' aufeinanderfolgende Zeichen aus dem gesuchten Wort ein.'
            );
        },
        loadingMore: function () {
            return 'Lade mehr Ergebnisse…';
        },
        maximumSelected: function (args) {
            var message = 'Sie können nur ' + args.maximum + ' Eintr';

            if (args.maximum === 1) {
                message += 'ag';
            } else {
                message += 'äge';
            }

            message += ' auswählen';

            return message;
        },
        noResults: function () {
            return 'Keine Übereinstimmungen gefunden';
        },
        searching: function () {
            return 'Suche…';
        },
        removeAllItems: function () {
            return 'Entferne alle Gegenstände';
        },
    };
}
