/*
 * Copyright 2019 Lightbend Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const crdt = require("cloudstate").crdt;

const entity = new crdt.Crdt(
  "social-poll.proto",
  "cloudstate.samples.social.polls.BasicPollService"
);

entity.defaultValue = () => new crdt.ORMap();

entity.commandHandlers = {
  AddUserVote: vote,
  GetCounts: getCounts
};


function vote(uservote, ctx) {
  let v = new crdt.ORSet();
  if (ctx.state.has(uservote.name)) {
    v = ctx.state.get(uservote.name);
  }
  v.add(uservote.vote.user);
  ctx.state.set(uservote.name, v);
  return {}
}


function getCounts(poll, ctx) {
  if (ctx.streamed) {
    ctx.onStateChange = state => {
      return {
        total: Array.from(state.get(poll.name)).length 
      };
    }
  }
  return {total: 0};
}

// Export the entity
module.exports = entity;
