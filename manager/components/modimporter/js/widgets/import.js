// Консоль

modImporter = {
    window: {}
    ,combo: {}
    ,panel: {}
    ,config: {}
};

// if(typeof modImporter.window == 'undefined'){
//     modImporter.window = {};
// }

modImporter.window.Console  = function(config) {
    config = config || {};
    
    Ext.applyIf(config,{
        baseParams: {
            action: config.action || 'console'
        }
    });
    
    Ext.applyIf(config,{
        title: _('console')
        ,modal: Ext.isIE ? false : true
        ,closeAction: 'hide'
        ,shadow: true
        ,resizable: false
        ,collapsible: false
        ,closable: true
        ,maximizable: true
        ,autoScroll: true
        ,height: 400
        ,width: 650
        ,refreshRate: 2
        ,cls: 'modx-window modx-console'
        ,items: [{
            itemId: 'header'
            ,cls: 'modx-console-text'
            ,html: _('console_running')
            ,border: false
        },{
            xtype: 'panel'
            ,itemId: 'body'
            ,cls: 'x-form-text modx-console-text'
            ,border: false
        }]
        ,buttons: [
            /*{
                text: _('console_download_output')
                ,handler: this.download
                ,scope: this
            },*/{
                text: 'Продолжить'
                ,itemId: 'continueBtn'
                ,disabled: true
                ,scope: this
                ,handler: this.StartImport
            },{
                text: _('ok')
                ,itemId: 'okBtn'
                ,disabled: false
                ,scope: this
                ,handler: this.hide
            }
        ]
        ,keys: [{
            key: Ext.EventObject.S
            ,ctrl: true
            ,fn: this.download
            ,scope: this
        },{
            key: Ext.EventObject.ENTER
            ,fn: this.hide
            ,scope: this
        }]
        
        ,autoHeight: false
        
        ,url: modImporter.config.connector_url + 'connector.php'
        
        
    });
    
    config.baseParams.output_format = 'json';
    config.baseParams.modimporter_step = config.step || 'modimporter_console_init';
    config.baseParams.modimporter_in_console_mode = true;   // Для отладки
    
    modImporter.window.Console.superclass.constructor.call(this,config);
    
    this.on('show', this.StartImport);
    // this.on('hide', this.close, this);
};

Ext.extend(modImporter.window.Console, MODx.Window,{
    
    StartImport: function(){
        // console.log(this.submit);
        this.submit();
    }
    
    ,submit: function(close) {
        // console.log(this);
        // return;
        close = close === false ? false : true;
        var f = this.fp.getForm();
        
        
        if (f.isValid() && this.fireEvent('beforeSubmit',f.getValues())) {
            f.submit({
                //waitMsg: _('saving')
                
                scope: this
                ,failure: function(frm,response) {
                    // console.log(response);
                    var response = Ext.decode(response.response.responseText);
                    
                    // console.log(this);
                    // console.log(response);
                    // if (this.fireEvent('failure',{f:frm,a:a})) {
                    //     MODx.form.Handler.errorExt(a.result,frm);
                    // }
                    // return;
                    
                    if(!response.message){
                        var response = {};
                        response.level = 1;
                        response.message = 'Что-то пошло не так... Попробуйте еще разок!';
                    }
                    
                    this.log(response);
                    this.fbar.setDisabled(false);
                }
                ,success: function(frm, response) {
                    //console.log(this);
                    // console.log(frm);
                    // console.log(response);
                    // 
                    // return;
                    
                    
                    try{
                        
                        var response = Ext.decode(response.response.responseText);
                    
                        var object = response.object;
                        
                        // console.log(response);
                        
                        // this.log(response.result.message);
                        this.log(response);
                        
                        
                        // if(!response.success || response.success == '0'){
                        //     MODx.msg.alert('Ошибка', response.message || 'Ошибка выполнения запроса');
                        //     return;
                        // }
                        
                        // Получаем и устанавливаем параметры
                        var form = this.fp.getForm();
                        for(var i in object){
                            //console.log(i);
                            //console.log(object.params[i]);
                            form.baseParams[i] = object[i];
                        }
                        
                        // return;
                        
                        if(response.step != ''){
                            
                            form.baseParams.modimporter_step = response.step;
                            
                            // return;
                        }
                        
                        
                        if (!response.continue) {
                            this.fireEvent('complete');
                            //this.fbar.setDisabled(false);
                            return;
                        }
                        
                        // console.log(response);
                        
                    }
                    catch(e){
                        alert('Ошибка разбора ответа');
                        console.log(e);
                        this.fbar.setDisabled(false);
                        return;
                    }
                    
                    
                    
                    
                    /*if (this.config.success) {
                        Ext.callback(this.config.success,this.config.scope || this,[frm,a]);
                    }
                    this.fireEvent('success',{f:frm,a:a});*/
                    
                    if(this.isVisible()){
                        //console.log(this);
                        //console.log(this.submit);
                        this.submit();
                    }
                    
                    // if (close) { this.config.closeAction !== 'close' ? this.hide() : this.close(); }
                }
            });
        }
    }
    
    ,log: function(response){
        try{
            
            
            // console.log(response);
            
            var msg = response.message;
            var level = response.level;
            
            var cls = '';
            
            // console.log(level);
            
            switch(level){
                
                case 1:
                    cls = 'error';
                    break;
                    
                case 2:
                    
                    cls = 'warn';
                    
                    break;
                    
                case 3:
                    
                    cls = 'info';
                    
                    break;
                    
                case 4:
                    
                    cls = 'debug';
                    
                    break;
                
            }
            
            msg = '<p class="'+cls+'">'+msg+'</p>';
            
            var out = this.getComponent('body');
            //  console.log(out);
            if (out) {
                out.el.insertHtml('afterBegin', msg);
                // e.data = '';
                out.el.scroll('b', out.el.getHeight(), true);
            }
        }
        catch(e){
            alert(e);
            return;
        }
    }
    
    // ,close: function(){
    //     console.log(this);
    // }
});

 

modImporter.panel.Import = function(config) {
    config = config || {};
    
    this.config = config;
    
    Ext.applyIf(config,{
        url: modImporter.config.connector_url + 'connector.php'
        ,bodyStyle: 'padding: 10px 15px;'
        // ,width: 400
        ,layout: 'form'
        ,items: [{
            html: '<h2>modImporter</h2>'
            , border: false
            , bodyStyle: 'margin: 10px 0 10px 0'
            , cls: 'modx-page-header'
        }, {
            xtype: 'modx-tabs'
            , id: 'referral-settings-tabs'
            , bodyStyle: 'padding: 10px'
            , defaults: {border: false, autoHeight: true}
            , border: true
            , hideMode: 'offsets'
            //,stateful: true
            //,stateId: 'referral-settings-tabpanel'
            //,stateEvents: ['tabchange']
            //,getState:function() {return { activeTab:this.items.indexOf(this.getActiveTab())};}
            , items: [{
                    title: _('modimporter')
                    ,items: [
                        {
                            html: '<p>Выберите файл для импорта</p>'
                            , border: false
                            , bodyCssClass: 'panel-desc'
                            , bodyStyle: 'margin-bottom: 10px'
                        }
                        ,this.getFileBrowser()
                        ,{
                            layout: 'form'
                            , bodyStyle: 'margin: 10px 0'
                            , labelAlign: 'top'
                            , items: [
                                this.getActionList()
                            ]
                            
                        }
                        ,{ 
                            border: false
                            , bodyStyle: 'margin-bottom: 10px'
                        }
                        ,this.GetStartimportButton()
                    ]
                },{
                    title: 'Экспорт'
                    ,items: [
                        {
                            html: '<p>Уже скоро...</p>'
                            , border: false
                            , bodyCssClass: 'panel-desc'
                            , bodyStyle: 'margin-bottom: 10px'
                        }
                    ]
                }
            ]
        }            
        ]
        ,listeners: {
            select: this.OnSelect
        }
    });
    
    modImporter.panel.Import.superclass.constructor.call(this,config);
};

Ext.extend(modImporter.panel.Import , MODx.Panel,{
    
    OnSelect: function(data){
        
        this.startimportButton.enable();
    }
    
    ,GetStartimportButton: function(){
        this.startimportButton = new Ext.Button({
            text: 'Запустить импорт'
            ,handler:  this.StartImport
            ,scope: this
            ,disabled: false
        });
        return this.startimportButton;
    }
    
    ,StartImport: function(){
        /*if(!this.pathname){
            MODx.msg.alert('Ошибка', "Необходимо выбрать файл для импорта");
            return;
        }*/
        /*console.log(this.FileBrowser);
        console.log(this.FileBrowser.getValue());
        console.log(this.FileBrowser.source);*/
        
        new modImporter.window.Console({        
            'register'  : 'mgr'       
            ,'topic' : '/npgitporter/import/source{$type}/'
            ,url: this.url
            ,baseParams:{
                action: this.comboActionList.getValue() || 'console'
                ,source: this.FileBrowser.source
                ,filename: this.FileBrowser.getValue()
            }
        }).show();
    }
    
    ,getFileBrowser: function(){
        
        this.FileBrowser = new MODx.combo.Browser({
         
                fieldLabel: 'Файл для загрузки'
                ,width: 350
                // ,hiddenName: 
                ,source: this.config.source
                ,listeners: {
                    'select': {
                        fn:function(data) {
                            //console.log(data);
                            //Ext.getCmp('tv'+this.config.tv).setValue(data.relativeUrl);
                            //Ext.getCmp('tvbrowser'+this.config.tv).setValue(data.relativeUrl);
                            this.fireEvent('select',data);
                        },
                        scope:this
                    }
                    /*,'change': {
                        fn:function(cb,nv) {
                            Ext.getCmp('tv'+this.config.tv).setValue(nv);
                            this.fireEvent('select',{
                                relativeUrl: nv
                                ,url: nv
                            });
                        },
                        scope:this
                    }*/
                }
        });
        return this.FileBrowser;
    }
    
    ,getActionList: function(){
        this.comboActionList = new MODx.combo.ComboBox({
            name: 'action'
            , fieldLabel: 'Формат'
            , width: 350                                    
            , hiddenName: 'action'
            , displayField: 'name'
            , valueField: 'action'
            , editable: false
            , fields: ['name', 'action']
            , pageSize: 0
            , emptyText: 'Выберите формат'
            , hideMode: 'offsets'
            , url: modImporter.config.connector_url + 'connector.php'
            , baseParams: {
                action: 'mgr/getactions'
            }
            ,listeners: {
                'select': {
                    fn:function(data) {
                        console.log(modImporter.config);
                    },
                    scope:this
                }
            }
        });
        return this.comboActionList;
    }
    
});

Ext.reg('modimporter-panel-import', modImporter.panel.Import);

 