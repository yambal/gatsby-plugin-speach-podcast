"use strict";
exports.__esModule = true;
var HtmlToSSML = function (channelTitle, cnannelDescription, title, markdown) {
    // console.log(markdown)
    var openning = "\n  <par>\n    <media begin=\"4s\" xml:id=\"openingtalk\">\n      <emphasis level=\"strong\">\n        <prosody rate=\"slow\" pitch=\"+1st\">" + channelTitle + "</prosody>\n      </emphasis>\n      <break time=\"2s\" />\n        " + cnannelDescription + "\n    </media>\n    <media begin=\"1s\" soundLevel=\"-24dB\" fadeOutDur=\"4s\" end=\"openingtalk.end+5s\">\n      <audio src=\"https://www.yambal.net/audio/se/bgm01.mp3\"/>\n    </media>\n  </par>\n  ";
    // <audio src="https://www.yambal.net/audio/se/opening01.mp3"/>
    var header = "\n  <emphasis level=\"strong\">\n      " + title + "\n  </emphasis>\n  <break time=\"2s\" />";
    var ssml = "<speak>\n    <prosody rate=\"125%\">\n      " + openning + "\n      " + header + "\n      " + markdown + "\n    </prosody>\n  </speak>";
    // H1
    ssml = ssml.split('<h1>').join("\n    <par>\n      <media begin=\"1.2s\">\n        <emphasis level=\"strong\">");
    ssml = ssml.split('</h1>').join("\n        </emphasis>\n      </media>\n      <media begin=\"0s\" soundLevel=\"-10dB\">\n        <audio src=\"https://www.yambal.net/audio/se/title01.mp3\"/>\n      </media>\n    </par><break time=\"2s\" />");
    // H2
    ssml = ssml.split('<h2>').join("\n    <par>\n      <media begin=\"1.2s\">\n        <emphasis level=\"strong\">");
    ssml = ssml.split('</h2>').join("\n        </emphasis>\n      </media>\n      <media begin=\"0s\" soundLevel=\"-20dB\">\n        <audio src=\"https://www.yambal.net/audio/se/title01.mp3\"/>\n      </media>\n    </par><break time=\"1.75s\" />");
    // H3
    ssml = ssml.split('<h3>').join('<emphasis level="strong">');
    ssml = ssml.split('</h3>').join('</emphasis><break time="1.5s" />');
    // H4
    ssml = ssml.split('<h4>').join('<emphasis level="strong">');
    ssml = ssml.split('</h4>').join('</emphasis><break time="1.25s" />');
    // H5
    ssml = ssml.split('<h5>').join('<emphasis level="strong">');
    ssml = ssml.split('</h5>').join('</emphasis><break time="1s" />');
    ssml = ssml.split('</p>').join('</p><break time="2s" />');
    ssml = ssml.split('<br>').join('<break time="1s" />');
    // console.log(ssml)
    return ssml;
};
exports["default"] = HtmlToSSML;
// <audio src="https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg"></audio>
