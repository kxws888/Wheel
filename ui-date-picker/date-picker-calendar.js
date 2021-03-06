/**
 * @file Date Calendar DOM From date-picker-calendar.js
 * @author <a href="http://www.closure.pro">Closure Man</a>
 * @version 0.0.2
 */


var DISABLE_CLS = 'disabled'
  , ENABLE_CLS = 'enabled'
  , ACTIVED_CLS = 'actived'
  , defaultTemplate = [
        '<caption>'
      ,   '<a href="javascript:" class="pre-month">&lt</a>'
      ,   '<span class="year-month"></span>'
      ,   ' <a href="javascript:" class="next-month">&gt</a>'
      , '</caption>'
      ,   '<thead>'
      ,     '<tr></tr>'
      ,   '</thead>'
      , '<tbody>'
      , '</tbody>'
    ].join('')
  , titles = {
      en : {
        days:["sunday", "monday", "tuesday", "wednesday", "thusday", "friday", "saturday"], daysShort:["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
      }
    , zh : {
        days:['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'], daysShort:['日', '一', '二', '三', '四', '五', '六']
      }
  }

function DatePicker(calendarId, options) {

  var defaultOptions = {
      defaultDate : firstDayOfMonth(today())
    , selectedDate: today()
    , maxDate     : null
    , minDate     : null
    , template    : defaultTemplate
    , calendarId  : 'wheel-cal'
    , yearMonthSel: '.year-month'
    , nextBtnSel  : '.next-month'
    , preBtnSel   : '.pre-month'
    , calBodySel  : '.wheel-cal-body'
    , enableCls   : ENABLE_CLS
    , disableCls  : DISABLE_CLS
    , activeCls   : ACTIVED_CLS
    , lang        : 'zh'
    , zIndex      : 1
  }

  defaultOptions.calendarId = calendarId ? calendarId : defaultOptions.calendarId

  if (options) {
    $.extend(defaultOptions, options)
  }

  this.calendarId = calendarId

  if (this instanceof DatePicker) {
    $.extend(this, defaultOptions)
    this.render()
    this.initEvents()
  }
  else {
    return new DatePicker(calendarId, options)
  }
}

DatePicker.prototype = {
    constructor:DatePicker

  , bindedElem: null            // 绑定的对应的元素, jQuery Object
  , relatedElem:null            // 当前选择的日期的元素
  , calendarElem:null           // 整个日历元素

  , initEvents:function () {
      var self = this

      self.calendarElem

        .on('click', '.' + self.enableCls, function () {
          self.relatedElem.removeClass(self.activeCls)
          $(this).addClass(self.activeCls)
          self.relatedElem = $(this)
          self.setSelected($(this).html())
        })

        .on('click', self.preBtnSel, function () {
          self.setMonth(self.defaultDate.getMonth() - 1)
        })

        .on('click', self.nextBtnSel, function () {
          self.setMonth(self.defaultDate.getMonth() + 1)
        })

        .on('click', function(event) {
          event.stopPropagation();
        })

    }

  , setMonth:function (month) {
      this.defaultDate.setMonth(month)
      this.reRender()
    }

  , setFullYear:function (year) {
      this.defaultDate.setFullYear(year)
      this.reRender()
    }

  , setSelected:function (date) {
      var d = new Date(this.defaultDate)
      d.setDate(date)
      this.selectedDate = d

      if (this.bindedElem) {
        this.bindedElem.trigger('change:date', this.selectedDate);
      }
    }

  , show:function (params) {
      var exactParams = {
          display: 'block'
        , top: this.bindedElem ? this.bindedElem.offset().top + this.bindedElem.height() : 0
        , left: this.bindedElem ? this.bindedElem.offset().left : 0
      }


      //$.extend(exactParams, params)
      this.calendarElem.css(exactParams);
    }

  , hide:function () {
      this.calendarElem.css({display:'none'})
    }

  , css: function(param) {
      this.calendarElem.css(param);
    }

  /**
   * 渲染日历
   *
   */
  , render:function () {
      this.calendarElem = $('<table>')

      this.calendarElem
        .css({
            'display': 'none'
          , 'position': 'absolute'
        })
        .attr('id', this.calendarId)
        .append(this.template)

      // start render
      this.renderHead()
      this.renderTitle(this.lang)
      this.renderBody(true)

      this.calendarElem.appendTo(document.body)
    }

  , renderHead:function () {
      var year = this.defaultDate.getFullYear()
        , month = this.defaultDate.getMonth()
        , self = this

      this.calendarElem
        .find('caption ' + self.yearMonthSel)
        .html(year + '年' + (month + 1) + '月');
    }

  /**
   * 根据给出的语言渲染周标题
   * @param  {String} lang 语言
   */
  , renderTitle:function (lang) {
      var daysShort = this.titles[lang].daysShort
        , daysHead = ['<th>', daysShort.join('</th><th>'), '</th>'].join('')

      this.calendarElem.find('thead tr').append(daysHead)
    }

  /**
   * 渲染日历体
   */
  , renderBody:function (first) {
      var calendar = generateCalendar(this.defaultDate)
        , self = this
        , body = self.calendarElem.find('tbody')
        , start = false

      body.find('tr').remove()
      body.hide()

      jQuery.each(calendar, function (index, aweek) {
        var weekRow = $('<tr>')

        weekRow.attr('class', 'aweek')

        jQuery.each(aweek, function (index, day) {
          var dayTD = $('<td>')
            , dayA = $('<a href="javascript:">')

          dayA.appendTo(dayTD)

          if (!start && day !== 1) {
            dayA.addClass(self.enableCls)
          }
          else if (!start && day === 1) {
            dayA.addClass(self.enableCls)
            start = true
          }
          else if (start && day === 1) {
            dayA.addClass(self.disableCls)
            start = false
          }
          else {
            dayA.addClass(self.enableCls)
          }

          if (!self.selectedDate) {
            self.selectedDate = self.defaultDate
            self.defaultDate.setDate(1)
          }

          if (dayA.hasClass(self.enableCls)) {
            var d = new Date(self.defaultDate)
            d.setDate(day)
            if (isSameDate(self.selectedDate, d)) {
              dayA.addClass(self.activeCls)
              self.relatedElem = dayA
            }
          }

          dayA.html(day + "")

          dayTD.appendTo(weekRow)
        })

        body.append(weekRow)
      })
      body.show()
    }


  /**
   * 重新渲染内容
   */
  , reRender : function () {
      this.renderHead()
      this.renderBody()
    }

    /**
     * 设置位置
     * @param {Number} x
     * @param {Number} y
     */
  , setPosition : function (top, left) {
     calendarElem.css({
         top:top
       , left:left
      })
    }

  , clear: function() {
      this.calendarElem.remove();
    }

  , template : null

  , titles : {
        en : {
            days:["sunday", "monday", "tuesday", "wednesday", "thusday", "friday", "saturday"]
          , daysShort:["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
        }
      , zh : {
          days:['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        , daysShort:['日', '一', '二', '三', '四', '五', '六']
      }
    }
}

