/*
  Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_control_Control from 'ol/control/Control'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_ext_inherits from '../util/ext'
import ol_ext_element from '../util/element'
import ol_control_Dialog from './Dialog'
import ol_control_Legend from './Legend'
import ol_control_Print from './Print'
import ol_control_CanvasTitle from './CanvasTitle'
import {getMapScale as ol_sphere_getMapScale} from '../geom/sphere'
import {setMapScale as ol_sphere_setMapScale} from '../geom/sphere'
import ol_control_Compass from './Compass';

/** Print control to get an image of the map
 * @constructor
 * @fire print
 * @fire error
 * @fire printing
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 *	@param {String} options.className class of the control
 *	@param {string} options.imageType A string indicating the image format, default image/jpeg
 *	@param {number} options.quality Number between 0 and 1 indicating the image quality to use for image formats that use lossy compression such as image/jpeg and image/webp
 *	@param {string} options.orientation Page orientation (landscape/portrait), default guest the best one
 *	@param {boolean} options.immediate force print even if render is not complete,  default false
 */
var ol_control_PrintDialog = function(options) {
  if (!options) options = {};

  var element = ol_ext_element.create('DIV', {
    className: (options.className || 'ol-print') + ' ol-unselectable ol-control'
  });
  ol_ext_element.create('BUTTON', {
    type: 'button',
    click: function() { 
      this.print(); 
    }.bind(this),
    parent: element
  });
  ol_control_Control.call(this, {
    element: element
  });

  // Print control
  options.target = ol_ext_element.create('DIV');
  var printCtrl = this._printCtrl = new ol_control_Print(options);
  printCtrl.on(['print','error','printing'], function(e) {
    content.setAttribute('data-status', e.type);
    if (!e.clipboard) {
      this.dispatchEvent(e);
    }
  }.bind(this));

  // North arrow
  this._compass = new ol_control_Compass({ 
    src: options.northImage || 'compact', 
    visible: false, 
    className: 'ol-print-compass', 
    style: new ol_style_Stroke({ color: '#333', width: 0 })
  });

  // Print dialog
  var printDialog = this._printDialog = new ol_control_Dialog({
    target: document.body,
    closeBox: true,
    className: 'ol-ext-print-dialog'
  });
  var content = printDialog.getContentElement();
  this._input = {};
  var param = ol_ext_element.create('DIV',{
    className: 'ol-print-param',
    parent: content
  });
  this._pages = [ ol_ext_element.create('DIV', { 
    className: 'ol-page'
  })];
  var printMap = ol_ext_element.create('DIV', {
    className: 'ol-map',
    parent: this._pages[0]
  });
  ol_ext_element.create('DIV', {
    html: this._pages[0],
    className: 'ol-print-map',
    parent: content
  });
  ol_ext_element.create('H2',{
    html: this.labels.title || 'Print',
    parent: param
  });
  var ul = ol_ext_element.create('UL',{ parent: param });

  // Orientation
  var li = ol_ext_element.create('LI', { 
    /*
    html: ol_ext_element.create('LABEL', {
      html: this.labels.orientation || 'Orientation'
    }),
    */
    className: 'ol-orientation',
    parent: ul 
  });

  this._input.orientation = { list: li };
  var label = ol_ext_element.create('LABEL', {
    className: 'portrait',
    parent: li
  });
  this._input.orientation.portrait = ol_ext_element.create('INPUT', {
    type: 'radio',
    name: 'ol-print-orientation',
    value: 'portrait',
    checked: true,
    on: { change: function(e) { 
      this.setOrientation(e.target.value);
    }.bind(this) },
    parent: label
  });
  ol_ext_element.create('SPAN', { 
    html: this.labels.portrait || 'Portrait',
    parent: label
  });

  label = ol_ext_element.create('LABEL', {
    className: 'landscape',
    parent: li
  });
  this._input.orientation.landscape = ol_ext_element.create('INPUT',{
    type: 'radio',
    name: 'ol-print-orientation',
    value: 'landscape',
    on: { change: function(e) { 
      this.setOrientation(e.target.value);
    }.bind(this) },
    parent: label
  });
  ol_ext_element.create('SPAN', { 
    html: this.labels.landscape || 'Landscape',
    parent: label 
  });

  // Page size
  var s; 
  li = ol_ext_element.create('LI',{ 
    html: ol_ext_element.create('LABEL', {
      html: this.labels.size || 'Page size',
    }),
    className: 'ol-size',
    parent: ul 
  });
  var size = this._input.size = ol_ext_element.create('SELECT', {
    on: { change: function(){
      this.setSize(size.value || originalSize);
    }.bind(this) },
    parent: li
  });
  for (s in this.paperSize) {
    ol_ext_element.create('OPTION', {
      html: s + (this.paperSize[s] ? ' - '+this.paperSize[s][0]+'x'+this.paperSize[s][1]+' mm' : ''),
      value: s,
      parent: size
    });
  }

  // Margin
  li = ol_ext_element.create('LI',{ 
    html: ol_ext_element.create('LABEL', {
      html: this.labels.margin || 'Margin',
    }),
    className: 'ol-margin',
    parent: ul 
  });
  var margin = this._input.margin = ol_ext_element.create('SELECT', {
    on: { change: function(){
      this.setMargin(margin.value);
    }.bind(this) },
    parent: li
  });
  for (s in this.marginSize) {
    ol_ext_element.create('OPTION', {
      html: s + ' - ' + this.marginSize[s] + ' mm',
      value: this.marginSize[s],
      parent: margin
    });
  }

  // Scale
  li = ol_ext_element.create('LI',{ 
    html: ol_ext_element.create('LABEL', {
      html: this.labels.scale || 'Scale',
    }),
    className: 'ol-scale',
    parent: ul 
  });
  var scale = this._input.scale = ol_ext_element.create('SELECT', {
    on: { change: function() {
      this.setScale(parseInt(scale.value))
    }.bind(this) },
    parent: li
  });
  Object.keys(this.scales).forEach(function(s) {
    ol_ext_element.create('OPTION', {
      html: this.scales[s],
      value: s,
      parent: scale
    });
  }.bind(this));

  // Legend
  li = ol_ext_element.create('LI',{ 
    className: 'ol-legend',
    parent: ul 
  });
  label = ol_ext_element.create('LABEL',{ 
    html: (this.labels.legend || 'Legend'),
    className: 'ol-ext-toggle-switch',
    parent: li
  });
  var legend = ol_ext_element.create('INPUT', {
    type: 'checkbox',
    checked: false,
    on: { change: function() {
      extraCtrl.legend.control.setCanvas(legend.checked);
    }.bind(this) },
    parent: label
  });
  ol_ext_element.create('SPAN', { parent: label });

  // North
  li = ol_ext_element.create('LI',{ 
    className: 'ol-print-north',
    parent: ul 
  });
  label = ol_ext_element.create('LABEL',{ 
    html: this.labels.north || 'North arrow',
    className: 'ol-ext-toggle-switch',
    parent: li
  });
  var north = this._input.north = ol_ext_element.create('INPUT',{ 
    html: this.labels.north || 'North arrow',
    type: 'checkbox',
    on:  { change: function() {
      this._compass.set('visible', north.checked);
      this.getMap().render();
    }.bind(this)},
    parent: label
  });
  ol_ext_element.create('SPAN', { parent: label });

  // North
  li = ol_ext_element.create('LI',{ 
    className: 'ol-print-title',
    parent: ul 
  });
  label = ol_ext_element.create('LABEL',{ 
    html: (this.labels.mapTitle || 'Title'),
    className: 'ol-ext-toggle-switch',
    parent: li
  });
  var title = ol_ext_element.create('INPUT', {
    type: 'checkbox',
    checked: false,
    on: { change: function(e) {
      extraCtrl.title.control.setVisible(e.target.checked);
    }.bind(this) },
    parent: label
  });
  var titleText = ol_ext_element.create('INPUT', {
    type: 'text',
    placeholder: (this.labels.mapTitle || 'Map title'),
    on: {
      keydown: function(e) { 
        if (e.keyCode === 13) e.preventDefault();
      },
      keyup: function() { 
        extraCtrl.title.control.setTitle(titleText.value);
      },
      change: function() {
        extraCtrl.title.control.setTitle(titleText.value);
      }.bind(this)
    },
    parent: li
  });
  ol_ext_element.create('SPAN', { parent: label });
  
  // User div element
  var userElt = ol_ext_element.create('DIV', {
    className: 'ol-user-param',
    parent: param
  });

  // Save as
  li = ol_ext_element.create('LI',{ 
    className: 'ol-saveas',
    parent: ul 
  });
  var copied = ol_ext_element.create('DIV', {
    html: this.labels.copied || 'Copied to clipboard',
    className: 'ol-clipboard-copy',
    parent: li
  });
  var save = ol_ext_element.create('SELECT', {
    on: { change: function() {
      // Copy to clipboard
      if (this.formats[save.value].clipboard) {
        printCtrl.copyMap(this.formats[save.value], function(isok) {
          if (isok) {
            copied.classList.add('visible');
            setTimeout(function() { copied.classList.remove('visible'); }, 1000);
          }
        });
      } else {
        // Print to file
        var format = (typeof(this.getSize())==='string' ? this.getSize() : null);
        var opt = Object.assign({
          format: format,
          size: format ? this.paperSize[format] : null,
          orient: this.getOrientation(),
          margin: this.getMargin(),
        }, this.formats[save.value]);
        printCtrl.print(opt);
      }
      save.value = '';
    }.bind(this) },
    parent: li
  });
  ol_ext_element.create('OPTION', {
    html: this.labels.saveas || 'Save as...',
    style: { display: 'none' },
    value: '',
    parent: save
  });
  this.formats.forEach(function(format, i) {
    ol_ext_element.create('OPTION', {
      html: format.title,
      value: i,
      parent: save
    });
  });
  
  // Print
  var prButtons = ol_ext_element.create('DIV', {
    className: 'ol-ext-buttons',
    parent: param
  });
  ol_ext_element.create('BUTTON', {
    html: this.labels.printBt || 'Print...',
    type: 'submit',
    click: function(e) {
      e.preventDefault();
      window.print();
    },
    parent: prButtons
  });
  ol_ext_element.create('BUTTON', {
    html: this.labels.cancel || 'cancel',
    type: 'button',
    click: function() { printDialog.hide(); },
    parent: prButtons
  });
  ol_ext_element.create('DIV', {
    html: this.labels.errorMsg,
    className: 'ol-error',
    parent: param
  });

  // Handle dialog show/hide
  var originalTarget;
  var originalSize;
  var scalelistener;
  var extraCtrl = {};
  printDialog.on('show', function() {
    var map = this.getMap();
    if (!map) return;
    // Print document
    document.body.classList.add('ol-print-document');
    originalTarget = map.getTargetElement();
    originalSize = map.getSize();
    if (typeof(this.getSize()) === 'string') this.setSize(this.getSize());
    else this.setSize(originalSize);
    map.setTarget(printMap);
    // Refresh on move end
    if (scalelistener) ol_Observable_unByKey(scalelistener);
    scalelistener = map.on('moveend', function() {
      this.setScale(ol_sphere_getMapScale(map));
    }.bind(this));
    // Compass
    this._compass.set('visible', this._input.north.checked);
    // Get extra controls
    this.getMap().getControls().forEach(function(c) {
      if (c instanceof ol_control_Legend) {
        extraCtrl.legend = { control: c };
      }
      if (c instanceof ol_control_CanvasTitle) {
        extraCtrl.title = { control: c };
      }
    }.bind(this));
    // Show hide title
    if (extraCtrl.title) {
      title.checked = extraCtrl.title.isVisible = extraCtrl.title.control.getVisible();
      titleText.value = extraCtrl.title.control.getTitle();
      title.parentNode.classList.add('visible');
    } else {
      title.parentNode.classList.remove('visible');
    }
    // Show hide legend
    if (extraCtrl.legend) {
      extraCtrl.legend.ison = extraCtrl.legend.control.onCanvas();
      extraCtrl.legend.collapsed = extraCtrl.legend.control.isCollapsed();
      extraCtrl.legend.control.collapse(false);
      legend.parentNode.classList.add('visible');
      legend.checked = !extraCtrl.legend.collapsed;
      extraCtrl.legend.control.setCanvas(!extraCtrl.legend.collapsed);
    } else {
      legend.parentNode.classList.remove('visible');
    }
    // hide
    this.dispatchEvent({ type: 'show', userElement: userElt, dialog: this._printDialog, page: this.getPage() });
  }.bind(this));

  printDialog.on('hide', function() {
    // North arrow
    this._compass.set('visible', false);
    // No print
    document.body.classList.remove('ol-print-document');
    if (!originalTarget) return;
    this.getMap().setTarget(originalTarget);
    originalTarget = null;
    if (scalelistener) ol_Observable_unByKey(scalelistener);
    // restore
    if (extraCtrl.title) {
      extraCtrl.title.control.setVisible(extraCtrl.title.isVisible);
    }
    if (extraCtrl.legend) {
      extraCtrl.legend.control.setCanvas(extraCtrl.legend.ison);
      extraCtrl.legend.control.collapse(extraCtrl.legend.collapsed);
    }
    this.dispatchEvent({ type: 'hide' });
  }.bind(this));

  // Update preview on resize
  window.addEventListener('resize', function() {
    this.setSize();
  }.bind(this));
};
ol_ext_inherits(ol_control_PrintDialog, ol_control_Control);

/** Print dialog labels (for customisation) */
ol_control_PrintDialog.prototype.labels = {
  title: 'Print',
  orientation: 'Orientation',
  portrait: 'Portrait',
  landscape: 'Landscape',
  size: 'Page size',
  margin: 'Margin',
  scale: 'Scale',
  legend: 'Legend',
  north: 'North arrow',
  mapTitle: 'Map title',
  saveas: 'Save as...',
  copied: '✔ Copied to clipboard',
  errorMsg: 'Can\'t save map canvas...',
  printBt: 'Print...',
  cancel: 'cancel'
};

/** List of paper size */
ol_control_PrintDialog.prototype.paperSize = {
  '': null,
  'A0': [841,1189],
  'A1': [594,841],
  'A2': [420,594],
  'A3': [297,420],
  'A4': [210,297],
  'A5': [148,210],
  'B4': [257,364],
  'B5': [182,257]
};

/** List of margin size */
ol_control_PrintDialog.prototype.marginSize = {
  none: 0,
  small: 5,
  large: 10
};

/** List of legeng options */
ol_control_PrintDialog.prototype.legendOptions = {
  off: 'Hide legend',
  on: 'Show legend'
};

/** List of print image file formats */
ol_control_PrintDialog.prototype.formats = [{
    title: 'copy to clipboard',
    imageType: 'image/png',
    clipboard: true
  }, {
    title: 'save as jpeg',
    imageType: 'image/jpeg',
    quality: .8
  }, {
    title: 'save as png',
    imageType: 'image/png',
    quality: .8
  }, {
    title: 'save as pdf',
    imageType: 'image/jpeg',
    pdf: true
  }
];

/** List of print scale */
ol_control_PrintDialog.prototype.scales = {
  '': '',   // Use current map scale
  ' 5000': '1/5.000',
  ' 10000': '1/10.000',
  ' 25000': '1/25.000',
  ' 50000': '1/50.000',
  ' 100000': '1/100.000',
  ' 250000': '1/250.000',
  ' 1000000': '1/1.000.000'
};

/** Get print orientation
 * @returns {string}
 */
ol_control_PrintDialog.prototype.getOrientation = function () {
  return this._orientation || 'portrait';
};

/** Set print orientation
 * @param {string} ori landscape or portrait
 */
ol_control_PrintDialog.prototype.setOrientation = function (ori) {
  this._orientation = (ori==='landscape' ? 'landscape' : 'portrait');
  this._input.orientation[this._orientation].checked = true;
  this.setSize();
};

/** Get print margin
 * @returns {number}
 */
ol_control_PrintDialog.prototype.getMargin = function () {
  return this._margin || 0;
};

/** Set print margin
 * @param {number}
 */
ol_control_PrintDialog.prototype.setMargin = function (margin) {
  this._margin = margin;
  this._input.margin.value = margin;
  this.setSize();
};

/** Get print size
 * @returns {ol.size}
 */
ol_control_PrintDialog.prototype.getSize = function () {
  return this._size;
};

/** Set map print size
 * @param {ol/size|string} size map size as ol/size or A4, etc.
 */
ol_control_PrintDialog.prototype.setSize = function (size) {
  // reset status
  this._printDialog.getContentElement().setAttribute('data-status','');
  
  if (size) this._size = size;
  else size = this._size;
  if (!size) return;

  if (typeof(size) === 'string') {
    size = size.toLocaleUpperCase();
    if (!this.paperSize[size]) size = this._size = 'A4';
    this._input.size.value = size;
    size = [
      Math.trunc(this.paperSize[size][0]* 96/25.4),
      Math.trunc(this.paperSize[size][1]* 96/25.4)
    ]
    if (this.getOrientation() === 'landscape') {
      size = [size[1], size[0]];
    }
    this.getPage().classList.remove('margin');
  } else {
    this._input.size.value = '';
    this.getPage().classList.add('margin');
  }

  var printElement = this.getPage();
  var s = printElement.parentNode.getBoundingClientRect();
  var scx = (s.width - 40) / size[0];
  var scy = (s.height - 40) / size[1];
  var sc = Math.min(scx, scy, 1);
  printElement.style.width = size[0]+'px';
  printElement.style.height = size[1]+'px';
  printElement.style['-webkit-transform'] = 
  printElement.style.transform = 'translate(-50%,-50%) scale('+sc+')';
  var px = Math.round(5/sc);
  printElement.style['-webkit-box-shadow'] = 
  printElement.style['box-shadow'] = px+'px '+px+'px '+px+'px rgba(0,0,0,.6)';
  printElement.style['padding'] = (this.getMargin() * 96/25.4)+'px';

  if (this.getMap()) {
    this.getMap().updateSize();
  }

  this.dispatchEvent({ type: 'dialog:refresh' });
};

/** Get dialog content element 
 * @return {Element}
 */
ol_control_PrintDialog.prototype.getContentElement = function () {
  return this._printDialog.getContentElement();
};

/** Get dialog user element 
 * @return {Element}
 */
ol_control_PrintDialog.prototype.getUserElement = function () {
  return this._printDialog.getContentElement().querySelector('.ol-user-param');
};

/** Get page element
 * @return {Element}
 */
ol_control_PrintDialog.prototype.getPage = function () {
  return this._pages[0]
};

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol_control_PrintDialog.prototype.setMap = function (map) {
  if (this.getMap()) {
    this.getMap().removeControl(this._compass);
    this.getMap().removeControl(this._printCtrl);
    this.getMap().removeControl(this._printDialog);
  }
  ol_control_Control.prototype.setMap.call(this, map);
  if (this.getMap()) {
    this.getMap().addControl(this._compass);
    this.getMap().addControl(this._printCtrl);
    this.getMap().addControl(this._printDialog);
  }
};

/** Set the current scale (will change the scale of the map)
 * @param {number|string} value the scale factor or a scale string as 1/xxx
 */
ol_control_PrintDialog.prototype.setScale = function (value) {
  ol_sphere_setMapScale(this.getMap(), value);
  this._input.scale.value = ' '+(Math.round(value/100) * 100);
};

/** Get the current map scale factor
 * @return {number} 
 */
ol_control_PrintDialog.prototype.getScale = function () {
  return ol_sphere_getMapScale(this.getMap());
};

/** Show print dialog 
 * @param {*}
 *  @param {ol/size|string} options.size map size as ol/size or A4, etc.
 *  @param {number|string} options.value the scale factor or a scale string as 1/xxx
 *  @param {string} options.orientation landscape or portrait
 *  @param {number} options.margin
 */
ol_control_PrintDialog.prototype.print = function(options) {
  options = options || {};
  if (options.size) this.setSize(options.size);
  if (options.scale) this.setScale(options.scale);
  if (options.orientation) this.setOrientation(options.orientation);
  if (options.margin) this.setMargin(options.margin);
  this._printDialog.show();
};

export default ol_control_PrintDialog
