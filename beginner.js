var stackJquery = $("#stack");
var codeJquery = $("#code");
var statementcounterJquery = $("#statementcounter");
var currentFrameJquery = null;
var currentFrameLevel = -1;

function lineate() {
	var sourceCode = $("#code").val();
	var codeArray = sourceCode.split("\n");
	for (let statementNum in codeArray) {
		var statement = codeArray[statementNum].trim();
		if (statement.length === 0) { continue; }
		var str = "<span>" + statementNum + ". </span><span class='lines'>" + statement + "</span><br>";
		$("#linedcode").append(str);
	}
}

function compile() {
	var code = $("#code").val();
	var tokens = parse(code);
	return treeify(tokens);
	// return extractNestedContents("{", "}", tokens);//treeify(parse(code));
}

function addFrame(functionName) {
	currentFrameJquery = $(document.createElement("div")).addClass("frame");
	var titleJquery = $(document.createElement("h2")).text(functionName);
	currentFrameJquery.append(titleJquery);
	stackJquery.append(currentFrameJquery);
	currentFrameLevel++;
}

function removeFrame() {
	if (currentFrameLevel < 0) {
		alert("removing nonexistent frame. program crashed.");
		return;
	}
	var oldTopFrame = currentFrameJquery;
	currentFrameJquery = currentFrameJquery.prev("div");
	oldTopFrame.remove();
	currentFrameLevel--;
	if (currentFrameLevel < 0) {
		alert("program ended");
		return;
	}
}

function addVariable(variableName) {
	if (currentFrameLevel < 0) {
		alert("adding variable to nonexistent frame. program crashed.");
		return;
	}
	var id = currentFrameLevel + "-" + variableName;
	if ($("#" + id).length === 0) {
		var inputJquery = $(document.createElement("input")).attr("id", id).val("UNDEFINED");
		var labelJquery = $(document.createElement("label")).attr("for", id).text(variableName);
		currentFrameJquery.append(labelJquery);
		labelJquery.append(inputJquery);
	}
	else {
		alert("variable already declared. program crashed.");
	}
}

function setVariable(variableName, value) {
	var id = "#" + currentFrameLevel + "-" + variableName;
	if ($(id).length > 0) {
		$(id).val(value);
	}
	else {
		alert("trying to overwrite nonexistent variable. program crashed.");
	}
}

function getVariable(variableName) {
	var id = "#" + currentFrameLevel + "-" + variableName;
	if ($(id).length > 0) {
		return $(id).val();
	}
	else {
		alert("trying to read nonexistent variable. program crashed.");
	}
}