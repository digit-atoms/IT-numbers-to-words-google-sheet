// Usage: =WRITTEN_NUMBER(32)

const i18n = {it : {
    "useLongScale": false,
    "baseSeparator": "",
    "unitSeparator": "",
    "generalSeparator": "",
    "wordSeparator": "",
    "base": {
        "0": "zero",
        "1": "uno",
        "2": "due",
        "3": "tre",
        "4": "quattro",
        "5": "cinque",
        "6": "sei",
        "7": "sette",
        "8": "otto",
        "9": "nove",
        "10": "dieci",
        "11": "undici",
        "12": "dodici",
        "13": "tredici",
        "14": "quattordici",
        "15": "quindici",
        "16": "sedici",
        "17": "diciassette",
        "18": "diciotto",
        "19": "diciannove",
        "20": "venti",
        "21": "ventuno",
        "23": "ventitré",
        "28": "ventotto",
        "30": "trenta",
        "31": "trentuno",
        "33": "trentatré",
        "38": "trentotto",
        "40": "quaranta",
        "41": "quarantuno",
        "43": "quaranta­tré",
        "48": "quarantotto",
        "50": "cinquanta",
        "51": "cinquantuno",
        "53": "cinquantatré",
        "58": "cinquantotto",
        "60": "sessanta",
        "61": "sessantuno",
        "63": "sessanta­tré",
        "68": "sessantotto",
        "70": "settanta",
        "71": "settantuno",
        "73": "settantatré",
        "78": "settantotto",
        "80": "ottanta",
        "81": "ottantuno",
        "83": "ottantatré",
        "88": "ottantotto",
        "90": "novanta",
        "91": "novantuno",
        "93": "novantatré",
        "98": "novantotto",
        "100": "cento",
        "101": "centuno",
        "108": "centootto",
        "180": "centottanta",
        "201": "duecentuno",
        "301": "tre­cent­uno",
        "401": "quattro­cent­uno",
        "501": "cinque­cent­uno",
        "601": "sei­cent­uno",
        "701": "sette­cent­uno",
        "801": "otto­cent­uno",
        "901": "nove­cent­uno"
    },
    "unitExceptions": {
        "1": "un"
    },
    "units": [
        {
            "singular": "cento",
            "avoidPrefixException": [
                1
            ]
        },
        {
            "singular": "mille",
            "plural": "mila",
            "avoidPrefixException": [
                1
            ]
        },
        {
            "singular": "milione",
            "plural": "milioni"
        },
        {
            "singular": "miliardo",
            "plural": "miliardi"
        },
        {
            "singular": "bilione",
            "plural": "bilioni"
        },
        {
            "singular": "biliardo",
            "plural": "biliardi"
        },
        {
            "singular": "trilione",
            "plural": "trilioni"
        },
        {
            "singular": "triliardo",
            "plural": "triliardi"
        },
        {
            "singular": "quadrilione",
            "plural": "quadrilioni"
        },
        {
            "singular": "quadriliardo",
            "plural": "quadriliardi"
        }
    ]
}
}

var languages = ["it"];

var shortScale = [100];
for (var i = 1; i <= 16; i++) {
  shortScale.push(Math.pow(10, i * 3));
}

var longScale = [100, 1000];
for (i = 1; i <= 15; i++) {
  longScale.push(Math.pow(10, i * 6));
}

const writtenNumber = {defaults : {
  noAnd: false,
  alternativeBase: null,
  lang: "it"
}};

/**
 * Converts numbers to their written form.
 *
 * @param {Number} n The number to convert
 * @param {Object} [options] An object representation of the options
 * @return {String} writtenN The written form of `n`
 * @customfunction
 */
function WRITTEN_NUMBER(n, options) {
  options = options || {};
  options = writtenNumber.defaults

  if (n < 0) {
    return "";
  }

  n = Math.round(+n);

  var language = typeof options.lang === "string"
    ? i18n[options.lang]
    : options.lang;

  if (!language) {
    if (languages.indexOf(writtenNumber.defaults.lang) < 0) {
      writtenNumber.defaults.lang = "en";
    }

    language = i18n[writtenNumber.defaults.lang];
  }
  
  var scale = language.useLongScale ? longScale : shortScale;
  var units = language.units;
  var unit;

  if (!(units instanceof Array)) {
    var rawUnits = units;

    units = [];
    scale = Object.keys(rawUnits);

    for (var i in scale) {
      units.push(rawUnits[scale[i]]);
      scale[i] = Math.pow(10, parseInt(scale[i]));
    }
  }

  var baseCardinals = language.base;
  var alternativeBaseCardinals = options.alternativeBase 
    ? language.alternativeBase[options.alternativeBase]
    : {};

  if (language.unitExceptions[n]) return language.unitExceptions[n];
  if (alternativeBaseCardinals[n]) return alternativeBaseCardinals[n];
  if (baseCardinals[n]) return baseCardinals[n];
  if (n < 100)
    return handleSmallerThan100(n, language, unit, baseCardinals, alternativeBaseCardinals, options);

  var m = n % 100;
  var ret = [];

  if (m) {
    if (
      options.noAnd &&
      !(language.andException && language.andException[10])
    ) {
      ret.push(WRITTEN_NUMBER(m, options));
    } else {
      ret.push(language.unitSeparator + WRITTEN_NUMBER(m, options));
    }
  }

  var firstSignificant;

  for (var i = 0, len = units.length; i < len; i++) {
    var r = Math.floor(n / scale[i]);
    var divideBy;

    if (i === len - 1) divideBy = 1000000;
    else divideBy = scale[i + 1] / scale[i];

    r %= divideBy;

    unit = units[i];

    if (!r) continue;
    firstSignificant = scale[i];

    if (unit.useBaseInstead) {
      var shouldUseBaseException =
        unit.useBaseException.indexOf(r) > -1 &&
        (unit.useBaseExceptionWhenNoTrailingNumbers
          ? i === 0 && ret.length
          : true);
      if (!shouldUseBaseException) {
        ret.push(alternativeBaseCardinals[r * scale[i]] || baseCardinals[r * scale[i]]);
      } else {
        ret.push(r > 1 && unit.plural ? unit.plural : unit.singular);
      }
      continue;
    }

    var str;
    if (typeof unit === "string") {
      str = unit;
    } else if (r === 1 || unit.useSingularEnding && r % 10 === 1
      && (!unit.avoidEndingRules || unit.avoidEndingRules.indexOf(r) < 0)) {
      str = unit.singular;
    } else if (unit.few && (r > 1 && r < 5 || unit.useFewEnding && r % 10 > 1 && r % 10 < 5
      && (!unit.avoidEndingRules || unit.avoidEndingRules.indexOf(r) < 0))) {
      str = unit.few;
    } else {
      str = unit.plural && (!unit.avoidInNumberPlural || !m)
        ? unit.plural
        : unit.singular;
      
      // Languages with dual
      str = (r === 2 && unit.dual) ? unit.dual : str;
      
      // "restrictedPlural" : use plural only for 3 to 10
      str = (r > 10 && unit.restrictedPlural) ? unit.singular : str;
    }

    if (
      unit.avoidPrefixException &&
      unit.avoidPrefixException.indexOf(r) > -1
    ) {
      ret.push(str);
      continue;
    }

    var exception = language.unitExceptions[r];
    var number =
      exception ||
      WRITTEN_NUMBER(
        r,
        writtenNumber.defaults
      );
    n -= r * scale[i];
    ret.push(number + " " + str);
  }

  var firstSignificantN = firstSignificant * Math.floor(n / firstSignificant);
  var rest = n - firstSignificantN;

  if (
    language.andWhenTrailing &&
    firstSignificant &&
    0 < rest &&
    ret[0].indexOf(language.unitSeparator) !== 0
  ) {
    ret = [ret[0], language.unitSeparator.replace(/\s+$/, "")].concat(
      ret.slice(1)
    );
  }
  
  // Languages that have separators for all cardinals.
  if (language.allSeparator) {
    for (var j = 0; j < ret.length-1; j++) {
      ret[j] = language.allSeparator + ret[j];      
    }
  }
  var result = ret.reverse().join(" ");
  return result;
}

function handleSmallerThan100(n, language, unit, baseCardinals, alternativeBaseCardinals, options) {
  var dec = Math.floor(n / 10) * 10;
  unit = n - dec;
  if (unit) {
    return (
      alternativeBaseCardinals[dec] || baseCardinals[dec] + language.baseSeparator + WRITTEN_NUMBER(unit, options)
    );
  }
  return alternativeBaseCardinals[dec] || baseCardinals[dec];
}

/**
 * @customfunction
 */
function TRIM_TEXT(input) {
  return input.toString().toLowerCase().trim().replaceAll(" ", "")
}

/**
 * @customfunction
 */
function SPLIT_TEXT(input, delimiter, pos) {
  return input.toString().split(delimiter)[pos]
}
