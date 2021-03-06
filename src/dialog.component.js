import { Component, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { dialogService } from './dialog.service.js';

export default class dialogComponent {
  static get annotations() {
    return [
      new Component({
        selector: 'atlui-dlg',
        template: `
          <div (window:resize)="redraw()" atlui-dragItem [(dragX)]="posX" [(dragY)]="posY" (dragStopped)="focus()" [dragContainment]="container" class="modal-dialog" [ngStyle]="{'display': visible ? 'block' : 'none'}">
            <div class="modal-content" (mousedown)="focus()" [atlui-resizable]="isResizable" [minWidth]="minWidth" [maxWidth]="maxWidth" [minHeight]="minHeight" [maxHeight]="maxHeight">
              <div atlui-dragItem-handle class="modal-header" >
                <button type="button" class="close" (click)="close()">
                  <span>&times;</span>
                </button>
                <div *ngFor="let control of controls">
                    <button type="button" (click)='control.action();'>
                        <span *ngIf="control.label" style='margin-right: 10px;'>{{control.label}}</span>
                        <i *ngIf="control.icon" class="icon" [ngClass]="'icon-'+control.icon"></i>
                    </button>
                </div>
                <h4 class="modal-title">{{title}}</h4>
              </div>
              <div class="modal-body">
                <ng-content></ng-content>
              </div>
            </div>
          </div>`,
        inputs: ["show", "isResizable", "height", "width", "minHeight", "maxHeight", "minWidth",
          "maxWidth", "container", "controls", "title"],
        outputs: ['showChange', "onClose", "heightChange", "widthChange"]
      })
    ];
  }

  constructor(elementRef, dialogService, cdr) {
    this.showChange = new EventEmitter();
    this.onClose = new EventEmitter();
    this.heightChange = new EventEmitter();
    this.widthChange = new EventEmitter();
    this.elementRef = elementRef;
    this.visible = false;
    this.isResizable = false;
    this.height = 500;
    this.minHeight = 100;
    this.maxHeight = Infinity;
    this.width = 300;
    this.minWidth = 100;
    this.maxWidth = Infinity;
    this.container = '';
    this.title = '';
    this.controls = [];
    this.dlgService = dialogService;
    this.posX = 0;
    this.posY = 0;
    this.cdr = cdr;
  }

  get show() {
    return this.model;
  }

  focus() {
    this.dlgService.focusDialog(this);
  }

  //set the variable show with input parameter and open or close modal.
  set show(val) {
    if (val !== this.model) {
      this.model = val;
      if (this.model) {
        this.open();
      } else {
        this.close();
      }
    }
  }

  //Open modal and add correct class on body for avoid the scroll on body
  //if we want a backdrop that create a backdrop into the body
  open() {
    this.model = true;
    this.showChange.emit(this.model);
    this.visible = true;
    this.dlgService.addDialog(this);
    this.cdr.detectChanges();
    this.redraw();
  }

  ngAfterViewInit() {
    this.redraw();
    var height = Math.min(this.maxHeight, this.height);
    var width = Math.min(this.maxWidth, this.width);
    var top = (window.innerHeight - height) / 2;
    var left = (window.innerWidth - width) / 2;
    this.element.style.top = top + "px";
    this.element.style.left = left + "px";
  }

  close() {
    this.model = false;
    this.showChange.emit(this.model);
    this.visible = false;
    this.onClose.emit();
    this.dlgService.removeDialog(this);
  }

  //Add classes to modal according to inputs parameters
  ngOnDestroy() {
    this.dlgService.removeDialog(this);
  }

  redraw() {
    this.element = this.elementRef.nativeElement.querySelector('.modal-dialog');
    this.content = this.elementRef.nativeElement.querySelector('.modal-content');
    this.header = this.elementRef.nativeElement.querySelector('.modal-header');
    this.body = this.elementRef.nativeElement.querySelector('.modal-body');
    if (this.maxHeight > this.container.offsetHeight || this.maxHeight === void 0) {
      this.maxHeight = this.container.offsetHeight;
    }

    if (this.maxWidth > this.container.offsetWidth || this.maxWidth === void 0) {
      this.maxWidth = this.container.offsetWidth;
    }

    if (this.maxHeight > window.innerHeight) {
      this.maxHeight = window.innerHeight;
    }
    if (this.maxWidth > window.innerWidth) {
      this.maxWidth = window.innerWidth;
    }

    if (this.width < this.minWidth) {
      this.width = this.minWidth;
    }

    if (this.height < this.minHeight) {
      this.height = this.minHeight;
    }
    this.content.style.width = this.width + "px";
    this.content.style.height = this.height + "px";
    this.content.style.minHeight = this.minHeight + "px";
    this.content.style.minWidth = this.minWidth + "px";

    this.content.style.maxHeight = this.maxHeight + "px";
    this.content.style.maxWidth = this.maxWidth + "px";

    var headerStyle = window.getComputedStyle(this.header, null);
    var contentStyle = window.getComputedStyle(this.content, null);
    var contentHeight = parseInt(contentStyle.getPropertyValue("height"));
    var contentBorderTop = parseInt(contentStyle.getPropertyValue("border-top-width"));
    var contentBorderBottom = parseInt(contentStyle.getPropertyValue("border-bottom-width"));
    var contentInnerHeight = contentHeight - contentBorderTop - contentBorderBottom;

    this.body.style.height = (contentInnerHeight - parseInt(headerStyle.getPropertyValue("height"))) + "px";

    if (this.visible) {
      this.focus();
    }

    this.widthChange.emit(this.width);
    this.heightChange.emit(this.height);
    this.cdr.detectChanges();
  }
}

dialogComponent.parameters = [ElementRef, dialogService, ChangeDetectorRef];
