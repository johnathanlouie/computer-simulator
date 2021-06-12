/**
 * 
 * @param {string} code 
 * @returns {Array.<string>}
 */
function parse(code) {
	var tokenRegex = /([a-zA-Z_]+\w*)|([+\-*\/%<>!();,{}])|(\d+)|(&&)|(\|\|)|("((\\{2})*|(\\")|[^"])*")|(==)|(=)/g;
	var tokenArray = code.match(tokenRegex);
	return tokenArray;
}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isValidIdentifier(token) {
	return /^[a-zA-Z_]+\w*$/.test(token) && !isKeyword(token);
}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isKeyword(token) {
	return [
		'int',
		'float',
		'bool',
		'char',
		'if',
		'else',
		'class',
		'while',
		'true',
		'false',
	].indexOf(token) !== -1;
}

/**
 * 
 * @param {number} openingBracketIndex 
 * @param {Array.<string>} tokens 
 * @returns {number}
 */
function findClosingBracketIndex(openingBracketIndex, tokens) {
	var nestLevel = 0;
	var openingBracket = tokens[openingBracketIndex];
	var closingBracket;
	switch (openingBracket) {
		case "{":
			closingBracket = "}";
			break;
		case "(":
			closingBracket = ")";
			break;
		default:
			throw new Error("compiler: unknown bracket type.");
	}
	for (let i = openingBracketIndex; i < tokens.length; i++) {
		if (tokens[i] === openingBracket) {
			nestLevel++;
		}
		else if (tokens[i] === closingBracket) {
			nestLevel--;
			if (nestLevel === 0) {
				return i;
			}
		}
	}
	throw new Error("compiler: no matching closing bracket.");
}

/**
 * 
 * @param {Array.<string>} tokens 
 * @returns 
 */
function treeify(tokens) {
	// tree is an array of statements and blocks. each block is a header and body. nesting possible.
	var tree = [];
	var treeNode = {};
	var startOfStatement = 0;
	for (let i = 0; i < tokens.length; i++) {
		switch (tokens[i]) {
			case ";":
				treeNode = {};
				treeNode.type = "statement";
				treeNode.tokens = tokens.slice(startOfStatement, i);
				startOfStatement = i + 1;
				tree.push(treeNode);
				break;
			case "{":
				var headerTokens = tokens.slice(startOfStatement, i);
				treeNode = blockClassifier(headerTokens);
				var lastIndex = findClosingBracketIndex(i, tokens);
				var bodyTokens = tokens.slice(i + 1, lastIndex);
				treeNode.body = treeify(bodyTokens);
				i = lastIndex;
				startOfStatement = i + 1;
				tree.push(treeNode);
				break;
		}
	}
	return tree;
}

var operators = [
	["!"],
	["*", "/", "%"],
	["+", "-"],
	["<", ">"],
	["=="],
	["&&"],
	["||"],
	["="],
];

function lowestOrderOperator() {

}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isOperator(token) {
	for (let operatorLevel of operators) {
		for (var op of operatorLevel) {
			if (token === op) {
				return true;
			}
		}
	}
	return false;
}

/*
variable.
operator.
group.
literal.
function.
*/
function subexpression(tokens) {
	for (let i = 0; i < tokens.length; i++) {
		if (isValidIdentifier(tokens[i])) {
			if (tokens[i + 1] === "(") {
				// is a function
			}
			else if (isOperator(tokens[i + 1])) {
				// variable
			}
			else {
				// something wrong
			}
		}
		else if (tokens[i] === '(') {
			// group
		}
		else if (isOperator(tokens[i])) {
			// operator
		}
		else if (isLiteral(tokens[i])) {
			// literal
		}
		else {
			//error
		}
	}
}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isBoolean(token) {
	return token === 'true' || token === 'false';
}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isInt(token) {
	return /^\d+$/.test(token);
}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isFloat(token) {
	return /^\d+.\d+$/.test(token);
}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isString(token) {
	return token.length > 1 && token[0] === '"' && token[token.length - 1] === '"';
}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isChar(token) {
	return token.length === 3 && token[0] === "'" && token[2] === "'";
}

/**
 * 
 * @param {string} token 
 * @returns {boolean}
 */
function isLiteral(token) {
	return isChar(token) || isInt(token) || isFloat(token) || isBoolean(token);
}

function statementParser(tokens) {

}

function blockClassifier(headerTokens) {
	var blockNode;
	switch (headerTokens[0]) {
		case "function":
			blockNode = nodeMakerFunction(headerTokens);
			break;
		case "if":
			blockNode = nodeMakerIf(headerTokens);
			break;
		case "else":
			if (headerTokens[1] === "if") {
				blockNode = nodeMakerElseIf(headerTokens);
			}
			else {
				blockNode = nodeMakerElse(headerTokens);
			}
			break;
		case "while":
			blockNode = nodeMakerWhile(headerTokens);
			break;
	}
	return blockNode;
}

function nodeMakerWhile(headerTokens) {
	var whileNode = {};
	whileNode.type = "while";
	if (headerTokens[0] !== "while") {
		throw new Error("compiler: no while keyword.");
	}
	var closeParenIndex = findClosingBracketIndex(1, headerTokens);
	whileNode.condition = headerTokens.slice(1, closeParenIndex);
	if (headerTokens.length > closeParenIndex + 1) {
		throw new Error("compiler: extra tokens in if header.");
	}
	return whileNode;
}

function nodeMakerElse(headerTokens) {
	var elseNode = {};
	elseNode.type = "else";
	if (headerTokens[0] !== "else") {
		throw new Error("compiler: no else keyword.");
	}
	if (headerTokens.length > 1) {
		throw new Error("compiler: extra tokens in else header.");
	}
	return elseNode;
}

function nodeMakerElseIf(headerTokens) {
	var elseifNode = {};
	elseifNode.type = "elseif";
	if (headerTokens[0] !== "else" || headerTokens[1] !== "if") {
		throw new Error("compiler: no else if keywords.");
	}
	var closeParenIndex = findClosingBracketIndex(2, headerTokens);
	elseifNode.condition = headerTokens.slice(2, closeParenIndex);
	if (headerTokens.length > closeParenIndex + 1) {
		throw new Error("compiler: extra tokens in else if header.");
	}
	return elseifNode;
}

function nodeMakerIf(headerTokens) {
	var ifNode = {};
	ifNode.type = "if";
	if (headerTokens[0] !== "if") {
		throw new Error("compiler: no if keyword.");
	}
	var closeParenIndex = findClosingBracketIndex(1, headerTokens);
	ifNode.condition = headerTokens.slice(1, closeParenIndex);
	if (headerTokens.length > closeParenIndex + 1) {
		throw new Error("compiler: extra tokens in if header.");
	}
	return ifNode;
}

function nodeMakerFunction(headerTokens) {
	var functionNode = {};
	functionNode.type = "function";
	functionNode.parameters = [];
	if (headerTokens[0] !== "function") {
		throw new Error("compiler: no function keyword.");
	}
	if (isValidIdentifier(headerTokens[1])) {
		functionNode.name = headerTokens[1];
	}
	else {
		throw new Error("compiler: bad function name. " + headerTokens[1]);
	}
	if (headerTokens[2] !== "(") {
		throw new Error("compiler: function declaration missing opening paren.");
	}
	if (headerTokens[3] !== ")") {
		if (isValidIdentifier(headerTokens[3])) {
			functionNode.parameters.push(headerTokens[3]);
		}
		else {
			throw new Error("compiler: invalid function parameter.");
		}
		for (let i = 4; i < headerTokens.length - 1; i += 2) {
			if (headerTokens[i] !== ",") {
				throw new Error("compiler: function declaration missing comma.");
			}
			if (isValidIdentifier(headerTokens[i + 1])) {
				functionNode.parameters.push(headerTokens[i + 1]);
			}
			else {
				throw new Error("compiler: invalid function parameter.");
			}
		}
	}
	if (headerTokens[headerTokens.length - 1] !== ")") {
		throw new Error("compiler: function declaration missing closing paren or contains extra invalid tokens.");
	}
	return functionNode;
}

function recombine(headerTokens) {
	var headerStr = "";
	for (let i of headerTokens) { headerStr += " " + i; }
}