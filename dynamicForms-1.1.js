(function($) {
	$.fn.dynamicForm = function(options) {			
		return new DynamicForm(this, options);
	};
})(jQuery);

var DynamicForm = function (element, options){
	this.element = element;  
	this.settings = $.extend({
            // These are the defaults.
				url: "#"
				
			}, options ); 
    log.debug(options);
    this.init();
};

DynamicForm.prototype = {
	init: function (){
		self = this;
		console.log("Initialize DynamicForm");
		localStorage.removeItem("dynForm"); //TODO: Uniek maken per formulier
			
		this.retrieveForm();
	},
	
	retrieveForm: function(mode, objectName, callback){
		log.info("retrieveForm start");
        log.debug("URL: "+this.settings.dialogs);
		var self = this;
        var data = localStorage.getItem("dynForm");
        var dataStr;
        if (data != null){
            dataStr = "json="+data;
        }
		$.ajax({
			url: this.settings.dialogs,
			method: "GET",
			data: dataStr, 
			dataType: "json"
		}).done(function(data) {
			log.debug(objectName+" retrieveNextForm ajax done");
       self.showForm(data);
			//callback(self);
		}).fail(function(jqXHR, textStatus, errorThrown){
			console.log("ERROR: " + jqXHR + textStatus + errorThrown);
      $(self.element).empty();
      $(self.element).html("<h1 class='error'>Deze chain heeft geen actieve dialoog</h1>");
		});
	},

	submit: function(){
		log.debug("SUBMIT FORM");
         alert("SUBMIT");
		this.settings.persistForm.persist(this.element);
		this.retrieveForm();
		return false;
	},

	showForm: function(form){
		log.debug("showForm");
    var self = this;
		html = this.settings.formRenderer.edit(form);	
        var theForm = $('<form class="dynForm" name="dynForm" enctype="application/json"/>');
        $(theForm).attr("action",this.settings.dialogs);
		$(this.element).empty();
		$(theForm).append(html);
        $(this.element).append(theForm);
        $(this.element).on("submit", ".dynForm", function(){
            self.settings.persistForm.persist(this);
            return self.settings.onSubmit(this);
		});
	
		$(this.element).on("change","input",function(){
			self.updateFields(this);
		});
		$(this.element).on("change","select",function(){
			self.updateFields(this);
		});
		//$(".dynForm").dynamicForm();
		$( ".datepicker" ).datepicker({
			  dateFormat: "dd-mm-yy"
		});
		$("[data-fieldset]").each(function(){
					console.log($(this).data("fieldset"));
					fieldSet = "[name='"+$(this).data("fieldset")+"']";
					$(this).parent().appendTo($(fieldSet));					
		});
        $("[data-action]").on("click", function(event){self.executeAction(event)});
        $("[data-mfield-options]").multifield();
		//this.showData(form, this.element);
		$( ".dropdown" ).dropdown();
		log.debug("showForm ready");
		
	},
	
	showData: function(data, context){
		log.debug("Showing data");
		var self = this;
		$(data).each(function(index, element){
			// voor velden: gewoon vullen
			if (element.field){
				fieldID = "[name="+element.field+"]";
				thisField = $(context).find(fieldID);
				self.setFieldValue(thisField, element);
			}
			//voor fieldsets, eerst opzoeken of nieuw maken
			if (element.fieldset){
				console.log("FIELDSET: "+element.fieldset+" "+element.index);
				thisSet = $("fieldset[name='"+element.fieldset+"'][data-index='"+element.index+"']");
				if (thisSet.length==1){
					console.log("SET GEVONDEN: "+$(thisSet).attr('name'));
					self.showData(element.data, thisSet)
					
				} else if (thisSet.length==0) {
					//Nieuwe maken
					$("#btnAdd").click();
					thisSet = $("fieldset[name='"+element.fieldset+"']")[element.index];
					$(thisSet).attr('data-index', element.index);
					self.showData(element.data, thisSet);
				}
				
			}
		});
	},
	
	setFieldValue: function(thisField, element){
		nodeType = $(thisField).attr('type'); //jQuery call van gemaakt, weet niet war er ergens anders stuk van gaat.
		nodeName = thisField.nodeName; //Hier de array verwijderd.
		if (nodeType=='radio'){
			console.log("Setting: "+$(thisField).attr("id")+" ==> "+element.value);
			$(thisField).val([element.value]);	
			console.log("Val: "+$(thisField).val());
		} else {
			if (nodeName=="SELECT"){
				$(thisField).data("selected", element.value);
				console.log("SELECT: "+$(thisField).data("selected"));
			} else {
				console.log("Setting: "+$(thisField).attr("id")+" ==> "+element.value);
				$(thisField).val(element.value);
				console.log("Val: "+$(thisField).val());
			}
		}
		$(thisField).change();
		console.log("Val: "+$(thisField).val());
	},
    
    executeAction: function(element){
        var self = this;
        if ($(element.target).data("action")){
            var url = $(element.target).data("action");
            var theForm = $(this.element).find("form");
            localStorage.removeItem("dynForm");  //AANPASSEN!!!
            this.settings.persistForm.persist(theForm);
            $.ajax({
                url: url,
                method: "GET",
                data: {"json": localStorage.getItem("dynForm")},
                dataType: "json"
            }).done(function(data) {
                log.debug(data);
                $.each(data.facts,function (name, value){
                    console.log(name+":"+value.value);
                    var thisField = ($('body').find('#'+name))[0];
                    if (typeof thisField !== 'undefined'){
                        self.setFieldValue(thisField, value);
                    }
                })
            }).fail(function(jqXHR, textStatus, errorThrown){
                console.log("ERROR: " + jqXHR + textStatus + errorThrown);
            });
            }
      log.debug("Execute Action: "+$(element.target).data("action"))  ;
    },
	
	updateFields: function (changedField){
		var self=this;
		log.debug("CHANGED: "+changedField.name+" = "+$(changedField).val());
		
		var fieldsetName = $(changedField).data("fieldset");
		var context = $('body');

		if (fieldsetName != null){ // als het veld in een fieldset zit: parent context opzoeken
			var parents = $(changedField).parents("fieldset[name='"+fieldsetName+"']");
			if (parents.length>0){
				log.debug("FIELDSET GEVONDEN: ",$(parents[0]).attr('name')," ",$(parents[0]).data("index"));
				context = $(parents[0]);
			}
		}
		// voor elk veld met data-condition evalueren of expressie waar is:
		$(context).find("[data-condition]").each(function(){
			var condition2Execute = $(this).data("condition");
			//Alleen als het gewijzigde veld in de expressie voorkomt
			if (condition2Execute.indexOf(changedField.name) >= 0){
				condition2Execute = self.prepareCondition(condition2Execute, context);
				
				log.debug("evaluate condition: "+condition2Execute);
				if (eval(condition2Execute)){
					if (this.nodeName=='SELECT'){
						var options = $(this).find("option");
						$.each(options, function(i, opt){
							optionCondition = self.prepareCondition($(opt).data("expression"), context);
							if (!optionCondition || eval(optionCondition)){
								$(opt).show();
							} else {
								$(opt).hide();
							}
						});
						
					}
					log.debug("Show: ",$(this).attr('name'));
					$(this).parent().show();
				} else {
					log.debug("Hide: ",$(this).attr('name'));
					$(this).parent().hide();

				}
			}
		})
	},
		
	prepareCondition: function (condition, context){
		var self=this;
		if (condition){
			otherFieldArray = condition.match(/{.*?}/g);
			while (otherFieldArray != null && otherFieldArray.length>0){ //Match minimal sets of {...}
				otherField = otherFieldArray.pop();
				fieldName = '#'+otherField.replace(/[{}]/g,"");
				fieldValue = self.getValue(fieldName, context); // Context toevoegen
				newCond = condition.replace(otherField, "'"+fieldValue+ "'");
				condition = newCond ;
			};
		} 
		return condition;
	},

	getValue: function (fieldName, context){
		log.debug("Context: ",$(context).attr('name'),$(context).data('index'), "FIELD: ", fieldName);
		var thisField = ($(context).find(fieldName))[0];
		var nodeType = thisField.type;
		var fieldValue="";
		switch (nodeType){
			case "select-one":
				fieldName += " option:selected";
				fieldValue =($(context).find(fieldName)).val();
				break;
			case "radio":
				fieldName += ":checked";
				fieldValue =($(context).find(fieldName)).val();
				break;
			case "checkbox":
				fieldName += ":checked";
				fieldValue =($(context).find(fieldName)).val();
				break;
			default:
				fld = $(context).find(fieldName);
				log.debug("Value: ",$(fld).val());
				fieldValue = ($(context).find(fieldName)).val();		
		}
		return fieldValue;
	},
};




