import { fabric } from 'fabric';



function obj2png(canvas) {
		var obj = canvas.getActiveObject();
		if (!obj) { return; }
		obj.exportPNG();
}