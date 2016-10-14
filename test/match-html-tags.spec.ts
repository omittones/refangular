import * as core from '../src/core';
import * as mocha from 'mocha';
import { expect } from 'chai';


describe('when parsing html', function() {

	var test = `
<single-tag></single-tag>
<single-tag single-tag=""></single-tag>
< single-tag></ single-tag>
<single-tag />
<single-tag/>
<single-tag single-tag="" />
`;

	it('should find all tag forms', function() {
		var usages = core.matchHtmlTags('', test, 'single-tag');
		expect(usages.length).to.be.equal(9);
	})
});