Given("an empty task list") do
  get_an_empty_task_list
  expect(list).to be_empty
end

When("I add an item called {string}") do |name|
  add_item(name)
end

Then("the list has exactly one item") do
  expect(list.length).to eq(1)
  last_item_mentioned(list[0])
end

Then("that item is called {string}") do |name|
  expect(last_item_mentioned.name).to eq name
end

Then("{string} is not {item_phase}") do |name, phase|
  expect(get_item_by_name(name).phase).not_to be phase
end

Then("{string} is {item_phase}") do |name, phase|
  expect(get_item_by_name(name).phase).to be phase
end

Given("an item is on my task list") do
  get_an_empty_task_list
  add_item("walk the dog")
  expect(get_item_by_name("walk the dog")).to be_a_kind_of(Item)
end

When("I complete the item") do
  complete_the_item!
end

Then(/the item is (?:still|back) on my list/) do
  expect(item_on_list?(last_item_mentioned)).to be true
end

Then("I can see that the item is {item_phase}") do |phase|
  expect(last_item_mentioned.phase).to be phase
end

Given("I have completed an item on my task list") do
  get_an_empty_task_list
  add_item("water the cactus")
  complete_the_item!
  expect(item_on_list?(last_item_mentioned)).to be true
end

When("the daily reset occurs") do
  daily_reset!
end

Then("the item is no longer on my list") do
  expect(item_on_list?(last_item_mentioned)).to be false
end

When("I dismiss the item") do
  dismiss_item(last_item_mentioned)
end

Given("I have dismissed an item on my task list") do
  get_an_empty_task_list
  add_item("do something stressful")
  dismiss_item(last_item_mentioned)
end

Given("the item isn't {item_phase}") do |phase|
  expect(last_item_mentioned.phase).not_to be phase
end

Given("there are five items on my task list in order: {item_order}") do |order|
  get_an_empty_task_list
  order.each { |n| add_item(n) }
  expect_order(order)
end

When("I move {item_name} to the top") do |item_name|
  move_to_top(get_item_by_name(item_name))
end

When("I move {item_name} to the bottom") do |item_name|
  move_to_bottom(get_item_by_name(item_name))
end

When("I move {item_name} between {item_name} and {item_name}") do |item_name, after, before|
  move_between(get_item_by_name(item_name),
    after: get_item_by_name(after),
    before: get_item_by_name(before))
end

Then("I can see that the new order is {item_order}") do |order|
  expect_order(order)
end
