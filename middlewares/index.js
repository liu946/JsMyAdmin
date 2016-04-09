/**
 * Created by liu on 16/4/8.
 */

exports.showBody = function() {
  return function*(next) {
    console.log('<<<------ this.request ----------------------->>>');
    console.log(this.request);
    console.log('-------- this.request.body ---------------------');
    console.log(this.request.body);
    console.log('-------- this.query ----------------------------');
    console.log(this.query);
    console.log('-------------- next -----------------------------');
    yield next;
    console.log('-------- this.response --------------------------');
    console.log(this.response);
    console.log('--------- the end -------------------------------\n\n\n\n\n');
  };
};


