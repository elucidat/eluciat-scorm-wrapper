/*
Elucidat SCORM API wrapper - https://github.com/elucidat/eluciat-scorm-wrapper/

Licensed under the MIT license

Copyright (c) 2013 Elucidat Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Debug_API = function () {};
// 2004 functions
Debug_API.prototype.Initialize = function () { console.log('Debug_api:Initialize'); return true; };
Debug_API.prototype.Terminate = function () { console.log('Debug_api:Terminate'); return true; };
Debug_API.prototype.GetValue = function (nam) { console.log('Debug_api:GetValue: '+nam); return "lms-not-present"; };
Debug_API.prototype.SetValue = function (nam,val) { console.log('Debug_api:SetValue: '+nam+'='+val); return ""; };
Debug_API.prototype.Commit = function () { console.log('Debug_api:Commit'); return true; };
Debug_API.prototype.GetLastError = function () { console.log('Debug_api:GetLastError (0)'); return 0; };
Debug_API.prototype.GetErrorString = function (code) { console.log('Debug_api:GetErrorString: '+code); return "lms-not-present"; };
Debug_API.prototype.GetDiagnostic = function (code) { console.log('Debug_api:GetDiagnostic: '+code); return "lms-not-present"; };
// 1.2 functions
Debug_API.prototype.LMSInitialize = function () { console.log('Debug_api:LMSInitialize'); return true; };
Debug_API.prototype.LMSTerminate = function () { console.log('Debug_api:LMSTerminate'); return true; };
Debug_API.prototype.LMSGetValue = function (nam) { console.log('Debug_api:LMSGetValue: '+nam); return "lms-not-present"; };
Debug_API.prototype.LMSSetValue = function (nam,val) { console.log('Debug_api:LMSSetValue: '+nam+'='+val); return ""; };
Debug_API.prototype.LMSCommit = function () { console.log('Debug_api:LMSCommit'); return true; };
Debug_API.prototype.LMSGetLastError = function () { console.log('Debug_api:LMSGetLastError (0)'); return 0; };
Debug_API.prototype.LMSGetErrorString = function (code) { console.log('Debug_api:LMSGetErrorString: '+code); return "lms-not-present"; };
Debug_API.prototype.LMSGetDiagnostic = function (code) { console.log('Debug_api:LMSGetDiagnostic: '+code); return "lms-not-present"; };

var Scorm = function (options) {
	this.scorm_interface = null;
	// default used by debug interface
	this.mode = '2004';
	this.active = false;
	this.objectives = 0;
	// we need to search window, window.parent(s) and window.top.opener for either API or API_1484_11
	//this._search_for_api ( window );
	
	if (this.scorm_interface == null) {
		console.log('LMS not present - Created SCORM '+this.mode+' Debug interface.'); 
		this.scorm_interface = new Debug_API();
	} else {
		console.log('Found SCORM '+this.mode+' interface.'); 
	}
};

Scorm.prototype._search_for_api = function ( win ) {
	try {
		while (win != null && this.scorm_interface == null) {
			// record the API if we've found it
			if (win.API) {
				this.scorm_interface = win.API;
				this.mode = '1.2';
			} else if (win.API_1484_11) {
				this.scorm_interface = win.API_1484_11;
				this.mode = '2004';
			}
			// now branch off to look at the window opener of this window.
			if (win.opener != null && !win.opener.closed)
				this._search_for_api ( win.opener );

			// if at the top - that's the end
			if (win == win.parent)
				win = null;
			else
				// up up up the tree
				win = win.parent;
		}
	} catch(err) {
		return null;
  	}
};
/* general API calls */
Scorm.prototype.Check = function () {
	var error = 0;
	if (this.mode == '2004') {
		error = this.scorm_interface.GetLastError(); 
		if (error) console.log( 'Error ('+error+'): '+this.scorm_interface.GetErrorString(error) );
	} else if (this.mode == '1.2') {
		error = this.scorm_interface.LMSGetLastError(); 
		if (error) console.log( 'Error ('+error+'): '+this.scorm_interface.LMSGetErrorString(error) );
	}
	return error;
};
Scorm.prototype.Initialize = function () { 
	console.log('Scorm:Initialize');
	if (this.mode == '2004') {
		this.scorm_interface.Initialize('');
	} else if (this.mode == '1.2') {
		this.scorm_interface.LMSInitialize('');
	}
	// check for errors
	if (!this.Check()) this.active = true;
	return this.active;
};
Scorm.prototype.Terminate = function () { 
	console.log('Scorm:Terminate');
	if (this.mode == '2004') {
		this.scorm_interface.Terminate('');
	} else if (this.mode == '1.2') {
		this.scorm_interface.LMSTerminate('');
	}
	// check for errors
	if (!this.Check()) this.active = false;
};
Scorm.prototype.SetValue = function ( varname, value ) { 
	if (this.active) {
		console.log('Scorm:SetValue: '+varname+'='+value);
		if (this.mode == '2004') this.scorm_interface.SetValue( varname, value );
		else if (this.mode == '1.2') this.scorm_interface.LMSSetValue( varname, value );
		// make sure that worked
		return this.Check();
	} else {
		console.log('Scorm:SetValue: ('+varname+') Ignored (LMS inactive)');
	}
};
Scorm.prototype.GetValue = function ( varname ) { 
	if (this.active) {
		console.log('Scorm:GetValue: '+varname);
		if (this.mode == '2004') return this.scorm_interface.GetValue( varname );
		else if (this.mode == '1.2') return this.scorm_interface.LMSGetValue( varname );
	} else {
		console.log('Scorm:GetValue: ('+varname+') Ignored (LMS inactive)');
	}
};
Scorm.prototype.Commit = function () { 
	console.log('Scorm:Commit');
	if (this.mode == '2004') {
		return this.scorm_interface.Commit('');
	} else if (this.mode == '1.2') {
		return this.scorm_interface.LMSCommit('');
	}
};
/* specific actions */
/* being friendly */
Scorm.prototype.GetLearnerName = function () { 
	if (this.mode == '2004')
		return this.GetValue('cmi.learner_name');
	else if (this.mode == '1.2')
		return this.GetValue('cmi.core.student_name');
};
/* Browsing History */
Scorm.prototype.GetLocation = function () { 
	if (this.mode == '2004')
		return this.GetValue('cmi.location');
	else if (this.mode == '1.2')
		return this.GetValue('cmi.core.lesson_location');
};
Scorm.prototype.SetLocation = function ( url ) { 
	if (this.mode == '2004')
		return this.SetValue('cmi.location', url);
	else if (this.mode == '1.2')
		return this.SetValue('cmi.core.lesson_location', url);
};
Scorm.prototype.GetCompletionStatus = function () { 
	if (this.mode == '2004') {
		// 2004 doesn't need any fixing
		return this.GetValue('cmi.completion_status');
		
	} else if (this.mode == '1.2') {
		// passed and failed are not relevant here - they are just in this case synonyms for completed and incomplete
		var status = this.GetValue('cmi.core.lesson_status');
		if (status == 'passed' || status == 'failed') return 'completed';
		return status;
	}
};
Scorm.prototype.SetCompletionStatus = function ( v ) { 
	// and send
	if (this.mode == '2004')
		return this.SetValue('cmi.completion_status', v);
	else if (this.mode == '1.2')
		return this.SetValue('cmi.core.lesson_status', v);
};
Scorm.prototype.GetOutcome = function () { 
	if (this.mode == '2004') {
		// 2004 doesn't need any fixing
		return this.GetValue('cmi.success_status');
	} else if (this.mode == '1.2') {
		// passed and failed are not relevant here - they are just in this case synonyms for completed and incomplete
		var status = this.GetValue('cmi.core.lesson_status');
		if (status == 'passed' || status == 'failed') return status;
		return 'unknown';
	}
};
Scorm.prototype.SetOutcome = function ( outcome ) { 
	if (this.mode == '2004') {
		// 2004 doesn't need any fixing
		this.SetCompletionStatus('completed');
		if (outcome == 'passed') {
			this.SetValue('cmi.success_status','passed');
		} else if (outcome == 'failed') {
			this.SetValue('cmi.success_status','failed');
		}
	} else if (this.mode == '1.2') {
		// complete and outcome are stored in the same variable, so we just use completion status
		if (outcome == 'passed') 
			this.SetCompletionStatus('passed');
		else if (outcome == 'failed') 
			this.SetCompletionStatus('failed');
	}
	// this one is important so save
	this.Commit();
};
/* Complete the course - maybe unnecessary */
Scorm.prototype.Passed = function () { 
	// set score
	// mark as complete
	this.SetOutcome( 'passed' );

};
Scorm.prototype.Failed = function () { 
	// set score
	// mark as complete
	this.SetOutcome( 'failed' );
};
Scorm.prototype.SetScore = function (score, min, max) { 
	if (this.mode == '2004') {
		this.SetValue('cmi.score.raw',score);
		this.SetValue('cmi.score.min',min);
		this.SetValue('cmi.score.max',max);
	} else if (this.mode == '1.2') {
		this.SetValue('cmi.core.score.raw',score);
		this.SetValue('cmi.core.score.min',min);
		this.SetValue('cmi.core.score.max',max);
	}
};
/* record an objective in the course */
Scorm.prototype.SetObjective = function ( objective_name, outcome, score, min, max ) { 
	this.SetValue('cmi.objectives.'+this.objectives+'.id', objective_name);
	this.SetValue('cmi.objectives.'+this.objectives+'.status', (outcome=='passed'?'passed':'failed'));
	this.SetValue('cmi.objectives.'+this.objectives+'.raw', (score?score:0));
	this.SetValue('cmi.objectives.'+this.objectives+'.max', (min?min:0));
	this.SetValue('cmi.objectives.'+this.objectives+'.min', (max?max:100));
	if (this.mode == '2004') {
		this.SetValue('cmi.objectives.'+this.objectives+'.completion_status','completed');
	}
	// increment
	this.objectives++;
};
