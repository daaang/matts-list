require "erb"
require "json"

class Item
  attr_reader :li

  def initialize(li)
    @li = li
  end

  def ==(other)
    name == other.name && phase == other.phase
  end

  def name
    unless obsolete?
      @name = li.find("label").text
    end

    @name
  end

  def phase
    unless obsolete?
      @phase = if li.find("input[type=checkbox]").checked?
        :complete
      elsif li[:class] == "item-due"
        :due
      end
    end

    @phase
  end

  def obsolete?
    li.inspect.start_with? "Obsolete"
  end

  def inspect
    "<Item #{phase.inspect} #{name.inspect}>"
  end
end

module KnowsTheUI
  def list
    all("li").map { |li| Item.new(li) }
  end

  def get_an_empty_task_list
    be_on_page
    click_button("Clear list")
  end

  def add_item(name)
    click_button("Add item")
    fill_in(with: name)
    click_button("Done")
    last_item_mentioned(list.last)
  end

  def get_item_by_name(name)
    try_and_get_item_by_name(name)
    expect(last_item_mentioned).not_to be_nil
    last_item_mentioned
  end

  def try_and_get_item_by_name(name)
    items = list.select { |item| item.name == name }
    if items.length == 1
      last_item_mentioned(items[0])
    else
      last_item_mentioned(nil)
    end
  end

  def last_item_mentioned(item = :unset)
    @last_item_mentioned = item unless item.equal?(:unset)
    @last_item_mentioned
  end

  def item_on_list?(item)
    last_item_mentioned(item)
    list.any? { |i| i.name == item.name }
  end

  def dismiss_item(item)
    last_item_mentioned(item)
    click_button("Dismiss #{item.name}")
  end

  def complete_the_item!
    last_item_mentioned.li.check
  end

  def daily_reset!
    click_button("Daily reset")
  end

  def expect_order(order)
    expect(list.length).to eq order.length
    order.each_index do |i|
      expect(list[i].name).to eq order[i]
    end
  end

  def move_to_top(item)
    last_item_mentioned(item)
    until find_button("Move up #{item.name}", disabled: :all).disabled?
      click_button("Move up #{item.name}")
    end
  end

  def move_to_bottom(item)
    last_item_mentioned(item)
    until find_button("Move down #{item.name}", disabled: :all).disabled?
      click_button("Move down #{item.name}")
    end
  end

  def move_between(item, after: nil, before: nil)
    last_item_mentioned(item)
    raise "impossible" unless list.index(after) < list.index(before)
    while list.index(item) < list.index(after)
      click_button("Move down #{item.name}")
    end
    while list.index(item) > list.index(before)
      click_button("Move up #{item.name}")
    end
  end

  def remember_the_list(list_of_names = :unset)
    @remember_the_list = list_of_names unless list_of_names.equal?(:unset)
    @remember_the_list
  end

  def log_in
    fakeuser = ERB::Util.url_encode(JSON.dump(
      id: "fake-uuid",
      name: "Chuck Finley",
      email: "chuck@hotmail.com"
    ))
    be_on_page("/?fakeuser=#{fakeuser}")
  end

  def log_out
    be_on_page("/")
  end

  def reload_the_page
    if last_item_mentioned
      name = last_item_mentioned.name
      refresh
      try_and_get_item_by_name(name)
    else
      refresh
    end
  end

  def be_on_page(path = :unset)
    path = @current_path || "/" if path.equal? :unset

    if @current_path != path
      @current_path = path
      if last_item_mentioned
        name = last_item_mentioned.name
        visit(path)
        try_and_get_item_by_name(name)
      else
        visit(path)
      end
    end
  end
end

World(KnowsTheUI)
