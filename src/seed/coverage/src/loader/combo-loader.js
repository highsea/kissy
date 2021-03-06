function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/loader/combo-loader.js']) {
  _$jscoverage['/loader/combo-loader.js'] = {};
  _$jscoverage['/loader/combo-loader.js'].lineData = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[30] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[31] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[33] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[36] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[37] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[44] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[49] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[54] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[69] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[78] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[79] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[87] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[89] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[99] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[105] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[116] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[132] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[138] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[139] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[157] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[172] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[174] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[176] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[179] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[187] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[193] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[194] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[195] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[202] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[216] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[220] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[226] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[229] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[230] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[231] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[237] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[238] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[245] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[252] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[253] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[254] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[255] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[258] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[262] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[266] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[270] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[281] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[292] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[294] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[297] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[305] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[307] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[311] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[312] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[319] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[322] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[329] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[338] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[339] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[340] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[341] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[349] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[353] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[358] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[359] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[364] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[365] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[368] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[371] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[374] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[375] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[377] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[378] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[380] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[383] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[386] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[389] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[403] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[405] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[407] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[410] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[415] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[419] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[426] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[430] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[433] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[442] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[443] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[446] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[447] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[448] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[453] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[456] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[457] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[458] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[460] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[462] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[463] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[464] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[465] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[466] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[467] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[470] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[471] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[475] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[479] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].functionData) {
  _$jscoverage['/loader/combo-loader.js'].functionData = [];
  _$jscoverage['/loader/combo-loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[12] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[13] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[18] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[19] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[20] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[24] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[25] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[28] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[29] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[30] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].branchData) {
  _$jscoverage['/loader/combo-loader.js'].branchData = {};
  _$jscoverage['/loader/combo-loader.js'].branchData['8'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['11'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['16'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['41'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['43'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['46'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['95'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['104'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['108'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['118'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['119'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['123'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['138'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['157'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['159'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['164'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['183'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['187'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['197'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['198'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['225'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['254'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['262'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['289'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['292'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['294'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['296'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['302'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['305'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['306'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['307'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['338'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['353'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['359'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['360'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['374'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['375'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['380'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['380'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['380'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['417'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['442'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['447'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['460'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['460'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['461'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['470'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['470'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['470'][1].init(2808, 23, 'currentComboUrls.length');
function visit355_470_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['461'][1].init(69, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit354_461_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['460'][2].init(845, 36, 'currentComboUrls.length > maxFileNum');
function visit353_460_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['460'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['460'][1].init(845, 143, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit352_460_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['447'][1].init(249, 25, '!currentMod.canBeCombined');
function visit351_447_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['442'][1].init(1429, 15, 'i < mods.length');
function visit350_442_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['417'][1].init(231, 15, 'tags.length > 1');
function visit349_417_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['380'][3].init(51, 19, 'mods.tags[0] == tag');
function visit348_380_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['380'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['380'][2].init(26, 21, 'mods.tags.length == 1');
function visit347_380_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['380'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['380'][1].init(26, 44, 'mods.tags.length == 1 && mods.tags[0] == tag');
function visit346_380_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['375'][1].init(1830, 32, '!(mods = typedCombos[comboName])');
function visit345_375_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['374'][1].init(1786, 21, 'comboMods[type] || {}');
function visit344_374_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['360'][1].init(30, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit343_360_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['359'][1].init(188, 41, 'groupPrefixUri = comboPrefixes[comboName]');
function visit342_359_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['353'][2].init(764, 83, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit341_353_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['353'][1].init(744, 113, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit340_353_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['338'][1].init(348, 5, 'i < l');
function visit339_338_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['307'][1].init(30, 20, 'modStatus != LOADING');
function visit338_307_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['306'][1].init(26, 27, '!waitingModules.contains(m)');
function visit337_306_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['305'][1].init(390, 19, 'modStatus != LOADED');
function visit336_305_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['302'][3].init(293, 22, 'modStatus === ATTACHED');
function visit335_302_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['302'][2].init(270, 19, 'modStatus === ERROR');
function visit334_302_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['302'][1].init(270, 45, 'modStatus === ERROR || modStatus === ATTACHED');
function visit333_302_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['296'][1].init(56, 8, 'cache[m]');
function visit332_296_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['294'][1].init(383, 19, 'i < modNames.length');
function visit331_294_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['292'][1].init(343, 11, 'cache || {}');
function visit330_292_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['289'][1].init(238, 9, 'ret || {}');
function visit329_289_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['262'][1].init(153, 7, '!mod.fn');
function visit328_262_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['254'][1].init(26, 9, '\'@DEBUG@\'');
function visit327_254_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['225'][1].init(26, 9, '\'@DEBUG@\'');
function visit326_225_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['198'][1].init(18, 19, 'str1[i] !== str2[i]');
function visit325_198_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['197'][1].init(147, 5, 'i < l');
function visit324_197_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['187'][1].init(205, 9, 'ms.length');
function visit323_187_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['183'][1].init(22, 18, 'm.status == LOADED');
function visit322_183_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['164'][1].init(386, 2, 're');
function visit321_164_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['159'][1].init(52, 34, 'script.readyState == \'interactive\'');
function visit320_159_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['157'][1].init(189, 6, 'i >= 0');
function visit319_157_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['138'][1].init(18, 5, 'oldIE');
function visit318_138_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['123'][1].init(804, 5, 'oldIE');
function visit317_123_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['119'][1].init(31, 12, 'config || {}');
function visit316_119_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['118'][1].init(489, 15, 'requires.length');
function visit315_118_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['108'][1].init(122, 27, '!config || !config.requires');
function visit314_108_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['104'][1].init(14, 26, 'typeof name === \'function\'');
function visit313_104_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['95'][1].init(56, 43, 'm = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/)');
function visit312_95_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['46'][1].init(167, 5, 'oldIE');
function visit311_46_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['43'][1].init(57, 22, 'mod.getType() == \'css\'');
function visit310_43_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['41'][1].init(831, 11, '!rs.combine');
function visit309_41_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['27'][1].init(69, 17, 'mod && currentMod');
function visit308_27_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['16'][1].init(18, 10, '!(--count)');
function visit307_16_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['11'][1].init(22, 17, 'rss && rss.length');
function visit306_11_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][2].init(56, 12, 'S.UA.ie < 10');
function visit305_8_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][1].init(45, 23, 'S.UA.ie && S.UA.ie < 10');
function visit304_8_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[8]++;
  var oldIE = visit304_8_1(S.UA.ie && visit305_8_2(S.UA.ie < 10));
  _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[11]++;
    var count = visit306_11_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
      if (visit307_16_1(!(--count))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[17]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[21]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[3]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[22]++;
  var mod;
  _$jscoverage['/loader/combo-loader.js'].lineData[23]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[4]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[26]++;
  successList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[27]++;
  if (visit308_27_1(mod && currentMod)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[29]++;
    logger.debug('standard browser get mod name after load : ' + mod.name);
    _$jscoverage['/loader/combo-loader.js'].lineData[30]++;
    Utils.registerModule(runtime, mod.name, currentMod.fn, currentMod.config);
    _$jscoverage['/loader/combo-loader.js'].lineData[31]++;
    currentMod = undefined;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[33]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[5]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[36]++;
  errorList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[37]++;
  complete();
}, 
  charset: charset};
  _$jscoverage['/loader/combo-loader.js'].lineData[41]++;
  if (visit309_41_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
    if (visit310_43_1(mod.getType() == 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[44]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[46]++;
      if (visit311_46_1(oldIE)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[47]++;
        startLoadModName = mod.name;
        _$jscoverage['/loader/combo-loader.js'].lineData[48]++;
        startLoadModTime = S.now();
        _$jscoverage['/loader/combo-loader.js'].lineData[49]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[54]++;
  S.Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[58]++;
  var Loader = S.Loader, logger = S.getLogger('s/loader'), Status = Loader.Status, Utils = Loader.Utils, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, ERROR = Status.ERROR, groupTag = S.now(), ATTACHED = Status.ATTACHED;
  _$jscoverage['/loader/combo-loader.js'].lineData[69]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[78]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[79]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[85]++;
  var currentMod;
  _$jscoverage['/loader/combo-loader.js'].lineData[86]++;
  var startLoadModName;
  _$jscoverage['/loader/combo-loader.js'].lineData[87]++;
  var startLoadModTime;
  _$jscoverage['/loader/combo-loader.js'].lineData[89]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*KISSY.require\s*\((.+)\);/g;
  _$jscoverage['/loader/combo-loader.js'].lineData[92]++;
  function getRequireVal(str) {
    _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
    var m;
    _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
    if (visit312_95_1(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[96]++;
      return m[1];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[99]++;
      return new Function('return (' + str + ')')();
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[103]++;
  ComboLoader.add = function(name, fn, config, runtime) {
  _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[104]++;
  if (visit313_104_1(typeof name === 'function')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[105]++;
    config = fn;
    _$jscoverage['/loader/combo-loader.js'].lineData[106]++;
    fn = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[108]++;
    if (visit314_108_1(!config || !config.requires)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[109]++;
      var requires = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[115]++;
      fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[116]++;
  requires.push(getRequireVal(dep));
});
      _$jscoverage['/loader/combo-loader.js'].lineData[118]++;
      if (visit315_118_1(requires.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[119]++;
        config = visit316_119_1(config || {});
        _$jscoverage['/loader/combo-loader.js'].lineData[120]++;
        config.requires = requires;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[123]++;
    if (visit317_123_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[125]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
      Utils.registerModule(runtime, name, fn, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[128]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[129]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[132]++;
      currentMod = {
  fn: fn, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[138]++;
    if (visit318_138_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[139]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[140]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[142]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
    Utils.registerModule(runtime, name, fn, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[150]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[157]++;
    for (i = scripts.length - 1; visit319_157_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[158]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[159]++;
      if (visit320_159_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[160]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[161]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[164]++;
    if (visit321_164_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[172]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[173]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[174]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[176]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[179]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[180]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[181]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[182]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[183]++;
  if (visit322_183_1(m.status == LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[184]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[187]++;
  if (visit323_187_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[188]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[193]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[194]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[195]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[196]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[197]++;
    for (var i = 0; visit324_197_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[198]++;
      if (visit325_198_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[199]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[202]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[205]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[210]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[216]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[218]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[220]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[223]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[224]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[225]++;
  if (visit326_225_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[226]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[229]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[230]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[231]++;
  Utils.registerModule(runtime, mod.getName(), S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[233]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[237]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[238]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[239]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[242]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[243]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[245]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[252]++;
  S.each(comboUrls['js'], function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[253]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[254]++;
  if (visit327_254_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[255]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[258]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[259]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[262]++;
  if (visit328_262_1(!mod.fn)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[263]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[266]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[267]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[270]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[281]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[289]++;
  ret = visit329_289_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[292]++;
  cache = visit330_292_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[294]++;
  for (i = 0; visit331_294_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[295]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[296]++;
    if (visit332_296_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[297]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[299]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[300]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[301]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[302]++;
    if (visit333_302_1(visit334_302_2(modStatus === ERROR) || visit335_302_3(modStatus === ATTACHED))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[303]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[305]++;
    if (visit336_305_1(modStatus != LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[306]++;
      if (visit337_306_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[307]++;
        if (visit338_307_1(modStatus != LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[308]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[309]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[311]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[312]++;
  waitingModules.remove(mod.getName());
  _$jscoverage['/loader/combo-loader.js'].lineData[314]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[316]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[319]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[322]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[329]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[338]++;
  for (; visit339_338_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[339]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[340]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[341]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[342]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[343]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[344]++;
    packageName = packageInfo.getName();
    _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[349]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[351]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[353]++;
    if (visit340_353_1((mod.canBeCombined = visit341_353_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[356]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[358]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[359]++;
      if (visit342_359_1(groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[360]++;
        if (visit343_360_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[364]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[365]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[368]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[371]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[374]++;
    typedCombos = comboMods[type] = visit344_374_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[375]++;
    if (visit345_375_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[376]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[377]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[378]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[380]++;
      if (visit346_380_1(visit347_380_2(mods.tags.length == 1) && visit348_380_3(mods.tags[0] == tag))) {
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[383]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[386]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[389]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[396]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[403]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[405]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[407]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[410]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[411]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[412]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[413]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[414]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[415]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[416]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[417]++;
      var tag = visit349_417_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[419]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[426]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[428]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[430]++;
      function pushComboUrl() {
        _$jscoverage['/loader/combo-loader.js'].functionData[30]++;
        _$jscoverage['/loader/combo-loader.js'].lineData[433]++;
        res.push({
  combine: 1, 
  fullpath: Utils.getMappedPath(runtime, prefix + currentComboUrls.join(comboSep) + suffix, Config.mappedComboRules), 
  mods: currentComboMods});
      }      _$jscoverage['/loader/combo-loader.js'].lineData[442]++;
      for (var i = 0; visit350_442_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[443]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[444]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[446]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[447]++;
        if (visit351_447_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[448]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[453]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[456]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[457]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[458]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[460]++;
        if (visit352_460_1(visit353_460_2(currentComboUrls.length > maxFileNum) || (visit354_461_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[462]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[463]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[464]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[465]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[466]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[467]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[470]++;
      if (visit355_470_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[471]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[475]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[479]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
