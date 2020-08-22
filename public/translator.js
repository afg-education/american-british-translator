import { americanOnly } from "./american-only.js";
import { britishOnly } from "./british-only.js";
import { americanToBritishSpelling } from "./american-to-british-spelling.js";
import { americanToBritishTitles } from "./american-to-british-titles.js";

const textInput = document.getElementById("text-input");
const translateBtn = document.getElementById("translate-btn");
const clearBtn = document.getElementById("clear-btn");
const localeSelection = document.getElementById("locale-select");
const translatedSentence = document.getElementById("translated-sentence");
const errorMessage = document.getElementById("error-msg");
const timeRegexAmerican = /\b(2[0-3]|[0-1]?[1-9]):([0-5][0-9])(\b|pm|am)/gi;
const timeRegexBritish = /\b(2[0-3]|[0-1]?[1-9]).([0-5][0-9])(\b|pm|am)/gi;

window.addEventListener("DOMContentLoaded", (event) => {
  translateBtn.addEventListener("click", handleTranslate);
  clearBtn.addEventListener("click", handleClear);
});

const handleClear = () => {
  errorMessage.innerText = "";
  textInput.value = "";
  translatedSentence.innerHTML = "";
};

const handleTranslate = () => {
  if (!translate()) {
    translatedSentence.innerHTML = "";
    return (errorMessage.innerText = "Error: No text to translate.");
  }
  errorMessage.innerText = "";
  translatedSentence.innerHTML = translate();
};

const translate = () => {
  const str = textInput.value;
  if (str.length === 0) {
    return false;
  }
  console.log(localeSelection);
  if (localeSelection.value === "american-to-british") {
    console.log("here");
    const [newStr, filtered] = parseAmerican(str);
    if (filtered.length === 0) {
      return "Everything looks good to me!";
    }
    return translateToBritish(newStr, filtered);
  } else {
    const [newStr, filtered] = parseBritish(str);
    if (filtered.length === 0) {
      return "Everything looks good to me!";
    }
    return translateToAmerican(newStr, filtered);
  }
};

const parseAmerican = (str) => {
  const combinedObj = {
    ...americanOnly,
    ...americanToBritishSpelling,
  };

  let filtered = [];
  let copyStr = (" " + str).slice(1);
  Object.keys(combinedObj).forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    if (regex.test(copyStr)) {
      let newTerm = combinedObj[term];
      str = str.replace(regex, newTerm);
      copyStr = copyStr.replace(regex, "");
      filtered.push(newTerm);
    }
  });
  // Second, we parse the titles
  Object.keys(americanToBritishTitles).forEach((term) => {
    // Add proper regex parsing to the string to escape `.`
    const escapedTerm = term.replace(".", "\\.");
    const regex = new RegExp(`\\b${escapedTerm}(?!\\S)`, "gi");
    if (regex.test(str)) {
      let newTerm = americanToBritishTitles[term];
      str = str.replace(regex, newTerm);
      filtered.push(newTerm);
    }
  });
  // Next we parse the time
  const matches = [...str.matchAll(timeRegexAmerican)];
  str = str.replace(timeRegexAmerican, `$1.$2$3`);
  for (const match of matches) {
    filtered.push(`${match[1]}.${match[2]}`);
  }
  return [str, filtered];
};

const translateToAmerican = (str, matchArr) => {
  matchArr.forEach((match) => {
    const regex = new RegExp(`\\b${match}\\b`, "gi");
    str = str.replace(regex, `<span class='highlight'>$&</span>`);
  });
  return str;
};

const parseBritish = (str) => {
  let filtered = [];

  // We use copy string to remove the chance of duplicates
  // Example: chippy -> fish and `chip shop` -> fish and `fish and chip shop`
  let copyStr = (" " + str).slice(1);
  // Loop through the British only list and the conversion files
  Object.keys(britishOnly).forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    if (regex.test(copyStr)) {
      let newTerm = britishOnly[term];
      str = str.replace(regex, newTerm);
      copyStr = copyStr.replace(regex, "");
      filtered.push(newTerm);
    }
  });
  Object.keys(americanToBritishSpelling).forEach((term) => {
    let target = americanToBritishSpelling[term];
    const regex = new RegExp(`\\b${target}\\b`, "gi");
    if (regex.test(copyStr)) {
      str = str.replace(regex, term);
      copyStr = copyStr.replace(regex, "");
      filtered.push(term);
    }
  });
  // Second, we parse the titles
  Object.keys(americanToBritishTitles).forEach((term) => {
    let target = americanToBritishTitles[term];
    const regex = new RegExp(`\\b${target}(?!\\S)`, "gi");
    if (regex.test(str)) {
      str = str.replace(regex, term);
      filtered.push(term);
    }
  });
  // Filter the time
  const matches = [...str.matchAll(timeRegexBritish)];
  str = str.replace(timeRegexBritish, `$1:$2$3`);
  for (const match of matches) {
    filtered.push(`${match[1]}:${match[2]}`);
  }

  return [str, filtered];
};

const translateToBritish = (str, matchArr) => {
  matchArr.forEach((match) => {
    const regex = new RegExp(match, "gi");
    str = str.replace(regex, `<span class='highlight'>$&</span>`);
  });
  return str;
};

/* 
  Export your functions for testing in Node.
  Note: The `try` block is to prevent errors on
  the client side
*/
try {
  module.exports = {};
} catch (e) {}
