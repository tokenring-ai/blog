import postClear from './commands/blog/post/clear.ts';
import postGet from './commands/blog/post/get.ts';
import postInfo from './commands/blog/post/info.ts';
import postPublish from './commands/blog/post/publish.ts';
import postSelect from './commands/blog/post/select.ts';
import providerGet from './commands/blog/provider/get.ts';
import providerList from './commands/blog/provider/list.ts';
import providerReset from './commands/blog/provider/reset.ts';
import providerSelect from './commands/blog/provider/select.ts';
import providerSet from './commands/blog/provider/set.ts';
import test from './commands/blog/test.ts';

export default [providerGet, providerList, providerSet, providerSelect, providerReset, postGet, postSelect, postInfo, postClear, postPublish, test];
