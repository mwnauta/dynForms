var PersistForm = function (){
};

PersistForm.prototype = {
	persist: function(form){
		//thisForm = $(elm).children("form.dynForm");
		var rsubmittable = /^(?:input|select|textarea|keygen)/i;
		var rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i;
		var rcheckableType =  /^(?:checkbox|radio)$/i ;
		var rCRLF = /\r?\n/g;
		var map = $(form).map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ), foo : "BAR" };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ), foo : "BAR" };
		} ).get();
		data = $(form).serializeArray();
		newData = {};
		$.each(data, function(i, item){
//			if ($(item).data(fieldset)){
//				console.log("PERSISTING FIELDSET: ");
//			}
			
			newData[item.name] = item.value;
		});
		if (localStorage.getItem("dynForm") != null){
			oldData = JSON.parse(localStorage.getItem("dynForm"));
			foo = $.extend(newData, oldData); 
		}
		if(typeof(Storage) !== "undefined") {
			localStorage.setItem("dynForm", JSON.stringify(newData));
		} else {
			// Sorry! No Web Storage support..
		}
	} 	
}