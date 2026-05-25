const navigationConfig = [
    {
        icon: 'fa fa-home',
        title: 'Dashboard',
        link: '/dashboard',
        // roles: ['admin', 'scientist', 'podept'],
    },
    {
        icon: 'fa fa-flask',
        title: 'Inventory',
        link: '/inventory',
        description: 'Your personal treasure trove—everything you own, right here! (No pirates allowed.)',
        roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    {
        icon: 'fa fa-list',
        title: 'Orders',
        link: '/orders',
        description: 'Peek at all the stuff you’ve ordered—proof that you’re the master of shopping!',
        roles: ['admin', 'groupleader', 'podept', 'purchase department', 'scientist','labMgmt'],
    },
    {
        icon: 'fa fa-share-alt',
        title: 'Sharing',
        link: '/sharing',
        description: 'Got things collecting dust? Toss them here so others can swoop in and claim them. Sharing is caring!',
        roles: ['admin', 'groupleader', 'scientist', 'labMgmt'],
    },
    {
        icon: 'fa fa-users',
        title: 'Groups',
        link: '/groups',
        description: 'Your squad’s secret lair—where all the group gossip and details live.',
        roles:  ['admin', 'groupleader', 'scientist', 'labMgmt'], // ['admin'] Only visible to Admins
    },
    {
        icon: 'fa fa-cogs',
        title: 'Protocol',
        link: '/protocol',
        description: 'The treasure chest of “how-to” guides for your experiments. Science ninjas, unite!',
        roles:  ['admin', 'groupleader', 'scientist', 'labMgmt'], // ['admin'] Only visible to Admins
    },
    {
        icon: 'fa fa-cogs',
        title: 'Budget',
        link: '/budget',
        description: 'Where science meets cents—track your spending like a financial wizard in the lab!',
        roles: ['admin', 'groupleader', 'labMgmt'],
    }
];

export default navigationConfig;
