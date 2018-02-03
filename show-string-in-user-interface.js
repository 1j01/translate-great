function getTextAndRangesInItWithAssociatedNodes(node, textSoFar) {
	
	var text = textSoFar || "";

	if (node.nodeType === 3) {
		var textOfNode = node.data;
		return {
			text: text + textOfNode,
			rangesForNodes: [{
				start: text.length,
				end: text.length + textOfNode.length,
				length: textOfNode.length,
				node: node
			}],
		};
	}

	var rangesForNodes = [];

	if (node = node.firstChild) do {
		var result = getTextAndRangesInItWithAssociatedNodes(node, text);
		text = result.text;
		rangesForNodes = rangesForNodes.concat(result.rangesForNodes);
	} while (node = node.nextSibling);

	return {text, rangesForNodes};

}

function escapeRegExp(s) {
	return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// TODO: handle templates (with escaped regexp joined with (non-escaped) .*)
function findStringInDOM(stringToFind){
	var {text, rangesForNodes} = getTextAndRangesInItWithAssociatedNodes(document.body);
	// TODO: match multiple (with escaped regexp)
	// and filter out stuff like scripts and stylesheets
	// could look at other implementations of this sort of thing like https://github.com/padolsey/findAndReplaceDOMText
	// which has `preset: "prose"` that you can do
	var match = text.match(escapeRegExp(stringToFind)); // note implicit new RegExp
	if(!match){
		console.error("No match!", "for:", stringToFind, "in:", text);
		return;
	}
	for (var i = 0; i < rangesForNodes.length; i++){
		var range = rangesForNodes[i];
		// TODO: || (range.end === match.index && i === rangesForNodes.length - 1)?
		if(range.start <= match.index && range.end > match.index){
			var node = range.node;
			return node.parentElement;
		}
	}
	
}

// user-specified for a given app
function findStringInUI(stringToFind){
	var el = findStringInDOM(stringToFind);
	if(el){
		var menu_container = el.closest(".menu-container");
		var menu_button = el.closest(".menu-button");
		var menu_item = el.closest(".menu-item");
		if(menu_button){
			return {
				element: menu_button,
				show: function(){
					// nothing needed except for Extras menu if it's hidden
				},
			}
		}else if(menu_item){
			return {
				element: menu_item,
				show: function(){
					var menu_button = menu_container.querySelector(".menu-button");
					$(menu_button).trigger("pointerdown");
					$(menu_button).trigger("pointerup");
				},
			};
		}
	}
}

// show a string in the user's UI using the user's UI DOM node showing code
// TODO: handle templates (with regexps and placeholders in the UI)
// var overlayInput; // global for dev (entering in devtools console repeatedly); running this multiple times I want it to clean itself up
function showStringInUsersUI(stringToFind){
	removeOverlay();
	var result = findStringInUI(stringToFind);
	if(!result){
		console.log("Not found:", stringToFind);
		return;
	}
	result.show();
	requestAnimationFrame(function(){
		removeOverlay();//YES this is called twice, it's to prevent a race condition; it's called good programming
		//and or temporary but thorough programming
		var rect = result.element.getBoundingClientRect();
		var overlay_input = overlayInput = document.createElement("input");
		overlay_input.value = stringToFind;
		document.body.appendChild(overlay_input);
		$(overlay_input).css({
			position: "fixed",
			zIndex: 500000,
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
			background: "yellow",
			color: "black",
			border: 0,
			outline: "1px solid black",
			outlineOffset: "0"
		});
		overlay_input.focus();
		overlay_input.select();
		// $(window).one("mousedown", function(){
		$(overlay_input).one("focusout", function(){
			removeOverlay();
		});
		// TODO: maybe if you click and the window wasn't focused previously,
		// don't remove the overlay, but instead highlight it with a rectangle that "hones in on it"
		// TODO: esc to remove the overlay
	});

}
function removeOverlay(){
	// typeof as opposed to just the normal falseyness check for dev (entering in devtools console repeatedly),
	// because it's global so it can clean up after a previous run
	// so it needs to not assume it's defined here
	if(typeof overlayInput !== "undefined" && overlayInput && overlayInput.parentNode){
		overlayInput.parentNode.removeChild(overlayInput);
	}
	overlayInput = null;
}

for (name in menus){
	var menu = menus[name];
	menu.forEach(function(item, i){
		if(typeof item === "object" && item.item){
			var text = item.item.replace("&", "");
			setTimeout(function(){
				showStringInUsersUI(text);
			}, Math.random() * 3000);
		}
	});
};
// showStringInUsersUI("Set As Wallpaper (Tiled)");
