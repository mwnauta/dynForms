var RenderForm = function (){
	
};

RenderForm.prototype = {

	edit: function(form){
		var theDiv = $("<div/>");
		//data = form.data;
		fields = form.fields;
		$(fields).each(function(index){
			if (this.condition){
				display="none"
			} else {
				display="display"
			}
			fieldName = this.name;
			fieldValue = this.value;
			if (this.type=='text' || this.type=='email' ){
				thisField = $("<input/>")
          .addClass('form-control')
					.attr('name', this.name)
					.attr('id', this.name)
					.attr('type', this.type)
					.attr('minlength', this.minlength)
					.attr('maxlength', this.maxlength)
					.attr('size', this.maxlength)
					.attr('regx', this.regx)
					.attr('value', fieldValue)
					.attr('data-condition', this.condition)
					.attr('data-fieldset', this.fieldset);
				if (this.required == "true"){
					$(thisField).attr('required', "");
				}
				$("<div/>")
					.appendTo($(theDiv))
					.addClass("input-group")
					.attr('style', "display: "+display)
					.append("<span class='input-group-addon'>"+this.label+"</span>")
					.append(thisField);
			} else if (this.type=='date' ){
				thisField = $("<input/>")
          .addClass('form-control')
					.attr('name', this.name)
					.attr('id', this.name)
					.attr('type', 'dateNL')
					.attr('value', fieldValue)
					.addClass('datepicker')
					.attr('data-condition', this.condition)
					.attr('data-fieldset', this.fieldset);					
				if (this.required == "true"){
					$(thisField).attr('required', "");
				}

				$("<div/>")
					.appendTo($(theDiv))
					.addClass("inputField")
					.attr('style', "display: "+display)
					.append("<span class='input-group-addon'>"+this.label+"</span>")
					.append(thisField);
			} else if (this.type=='radio' ){
					inputField = $("<div/>")
						.appendTo($(theDiv))
						.addClass("inputField")
						.attr('style', "display: "+display)
						.append("<label class='label'>"+this.label+"</label>");
					fieldName = this.name;
					$(this.options).each(function(index){
						thisField = $("<input/>")
							.attr('name', fieldName)
							.attr('id', fieldName)
							.attr('type', 'radio')
							.attr('value', this.value)							
							.attr('data-fieldset', this.fieldset)
							.attr('checked', (fieldValue==this.value? true: false));
						$(inputField).append(thisField).append(this.caption);
					});
			} else if (this.type=='dropdown' ){
					inputField = $("<div/>")
						.appendTo($(theDiv))
						.addClass("input-group")
						.attr('style', "display: "+display)
						.append("<span class='input-group-addon'>"+this.label+"</span>");
					dropdown = $("<select class='form-control dropdown'/>")
						.attr('name', this.name)
						.attr('id', this.name)
						.attr('data-condition',this.condition)
						.attr('data-fieldSet', this.fieldset)
						.attr('data-url', this.url)
						.appendTo(inputField);						
					$(this.options).each(function(index){
						thisField = $("<option/>")
							.attr('name', fieldName)
							.attr('id', fieldName)
							.attr('type', 'radio')
							.attr('value', this.value)							
							.attr('data-fieldset', this.fieldset)
							.text(this.caption)
							.hide().show();
                        if (typeof fieldValue !== 'undefined' && fieldValue==this.value ){
                            $(thisField).attr('selected');
                        }
                        $(dropdown).append(thisField);
						  //$(inputField).append(thisField).append(this.caption);
					});

			} else if (this.type=='fieldset' ){
				$("<div/>")
					.appendTo($(theDiv))
					.addClass("inputField")
					.attr('style', "display: "+display)
					.attr('data-mfield-options', '{"section": ".group","btnAdd":"#btnAdd","btnRemove":".btnRemove"}')
					.append('<div class="row"><div class="ui-icon ui-icon-circle-plus" id="btnAdd">Toevoegen</div></div>')
					.append('<div class="row group"><fieldset name="'+this.name+'" data-index="0"><legend>'+this.name+'</legend></fieldset><div class="ui-icon ui-icon-circle-close btnRemove">Remove</div></div>');
			} else if (this.type=='hidden'){
				thisField = $("<input/>")
					.attr('name', this.name)
					.attr('id', this.name)
					.attr('type', this.type)
					.attr('value', this.value);
				$("<div/>")
					.appendTo($(theDiv))
					.append(thisField);					
			} else if (this.type=='button'){
                thisField = $("<input/>")
          .addClass("btn btn-default")
					.attr('name', this.name)
					.attr('id', this.name)
					.attr('type', this.type)
					.attr('value', this.label)
					.attr('data-condition', this.condition)
          .attr('data-action', this.action)
					.attr('data-fieldset', this.fieldset);
				$("<div/>")
					.appendTo($(theDiv))
					.addClass("inputField")
					.attr('style', "display: "+display)
					.append("<label class='label'>&nbsp;</label>")
					.append(thisField);			
            }
		});
		return theDiv;	
	}
	
};

