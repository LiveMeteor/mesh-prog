namespace fw {
	/**
	 * 把 point 事件转换成对应属性值的控制器
	 * 注意所控制的 Container 关闭时及时释放此控制器
	 */
	export class TouchMoveCtrl {

		/** 触摸点容错 */
		public touchShake: number = 3;
		/** 按下状态 */
		public isTouchDown: boolean;

		protected target: Document;
		protected bindXProp?: {
			target: any;
			prop: string;
		};
		protected bindYProp?: {
			target: any;
			prop: string;
		};
		protected bindXYProp?: {
			target: any;
			getfunc: () => Point;
			setfunc: (posx: number, posy: number) => void;
		};
		protected bindBeginProp?: {
			target: any;
			func: Function;
		};
		protected bindEndProp?: {
			target: any;
			func: Function;
		};
		protected beginPoint?: Point;
		protected nowPoint?: Point;
		private beginX: number = 0;
		private beginY: number = 0;

		public constructor(target: Document) {
			TouchMoveCtrl.self = this;
			this.isTouchDown = false;
			this.target = target;
			this.target.addEventListener("pointerdown", TouchMoveCtrl.eventBridge, false);
			this.target.addEventListener("pointermove", TouchMoveCtrl.eventBridge, false);
			this.target.addEventListener("pointerup", TouchMoveCtrl.eventBridge, false);
			this.target.addEventListener("pointercancel", TouchMoveCtrl.eventBridge, false);
		}

		private static self: TouchMoveCtrl;
		private static eventBridge(evt: PointerEvent): void {
			TouchMoveCtrl.self.onTouchScroll.call(TouchMoveCtrl.self, evt);
		}

		protected onTouchScroll(evt: PointerEvent): void {
			if (evt.type == "pointerdown") {
				this.isTouchDown = true;
				if (this.bindBeginProp && this.bindBeginProp.func.length == 0)
					this.bindBeginProp.func.call(this.bindBeginProp.target);
				else if (this.bindBeginProp)
					this.bindBeginProp.func.call(this.bindBeginProp.target, evt);
				this.beginPoint = {x: evt.x, y: evt.y};
				// console.log(`TOUCH_BEGIN ${this.beginPoint.x} ${this.beginPoint.y}`);
				if (this.bindXProp)
					this.beginX = this.bindXProp.target[this.bindXProp.prop];
				if (this.bindYProp)
					this.beginY = this.bindYProp.target[this.bindYProp.prop];
				if (this.bindXYProp) {
					let begin: Point = this.bindXYProp.getfunc.call(this.bindXYProp.target);
					this.beginX = begin.x;
					this.beginY = begin.y;
				}
			}
			else if (this.beginPoint && (evt.type == "pointermove" || evt.type == "pointerup" || evt.type == "pointercancel")) {
				if (!this.isTouchDown)
					return;
				this.nowPoint = {x: evt.x, y: evt.y};
				// console.log(`TOUCH_MOVE ${evt.type} ${this.nowPoint.x} ${this.nowPoint.y}`);
				if (this.touchShake > 0 && evt.type == "pointermove" &&
					(this.nowPoint.x - this.beginPoint.x < this.touchShake && this.nowPoint.x - this.beginPoint.x > -this.touchShake ||
						this.nowPoint.y - this.beginPoint.y < this.touchShake && this.nowPoint.y - this.beginPoint.y > -this.touchShake))
					return;
				if (this.bindXProp)
					this.bindXProp.target[this.bindXProp.prop] = this.beginX + (this.nowPoint.x - this.beginPoint.x);
				if (this.bindYProp) {
					this.bindYProp.target[this.bindYProp.prop] = this.beginY + (this.nowPoint.y - this.beginPoint.y);
				}
				if (this.bindXYProp)
					this.bindXYProp.setfunc.call(this.bindXYProp.target, this.beginX + (this.nowPoint.x - this.beginPoint.x), this.beginY + (this.nowPoint.y - this.beginPoint.y));
			}
			if (evt.type == "pointerup" || evt.type == "pointercancel") {
				if (!this.isTouchDown)
					return;
				if (this.bindEndProp && this.bindEndProp.func.length == 0)
					this.bindEndProp.func.call(this.bindEndProp.target);
				else if (this.bindEndProp)
					this.bindEndProp.func.call(this.bindEndProp.target, evt);
				this.beginPoint = undefined;
				this.isTouchDown = false;
			}
		}
		/**
		 * 绑定 X 轴变化触发的目标属性变化
		 * target[prop] 属性必须是 number 且有初始值
		 */
		public bindXChange(target: any, prop: string): void {
			if (typeof (target[prop]) != "number") {
				console.error(this, "bind property is not number type!!!");
				return;
			}
			this.bindXProp = { target, prop };
		}
		/**
		 * 绑定 Y 轴变化触发的目标属性变化
		 * target[prop] 属性必须是 number 且有初始值
		 */
		public bindYChange(target: any, prop: string): void {
			if (typeof (target[prop]) != "number") {
				console.error(this, "bind property is not number type!!!");
				return;
			}
			this.bindYProp = { target, prop };
		}
		/**
		 * 按下时触发的方法
		 * @param func 可以没有参数，也可以有一个参数
		 */
		public bindMoveBeginFunc(target: any, func: Function): void {
			this.bindBeginProp = { target, func };
		}
		/** 绑定 XY 位置变化时触发的方法 */
		public bindXYChange(target: any, getfunc: () => Point, setfunc: (posx: number, posy: number) => void): void {
			this.bindXYProp = { target, getfunc, setfunc };
		}
		/**
		 * 抬起或滑出时触发的方法
		 * @param func 可以没有参数，也可以有一个参数
		 */
		public bindMoveEndFunc(target: any, func: Function): void {
			this.bindEndProp = { target, func };
		}
		public destroy(): void {
			this.target.removeEventListener("pointerdown", TouchMoveCtrl.eventBridge, false);
			this.target.removeEventListener("pointermove", TouchMoveCtrl.eventBridge, false);
			this.target.removeEventListener("pointerup", TouchMoveCtrl.eventBridge, false);
			this.target.removeEventListener("pointercancel", TouchMoveCtrl.eventBridge, false);
		}
	}

}
