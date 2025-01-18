import React from 'react';
import Layout from '../components/layouts/Layout';
import AccountingTabs from '../components/accounting/AccountingTabs';

function AccountingPage() {
	return (
		<Layout>
			<div className='z-0'>
				<AccountingTabs />
			</div>
		</Layout>
	);
}

export default AccountingPage;
