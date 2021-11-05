class Item
  def initialize(li)
    @li = li
  end

  def name
    li.text
  end

  def state
    case li[:class]
    when "item-due"
      :due
    when "item-optional"
      :optional
    when "item-complete"
      :complete
    end
  end

  def inspect
    "<Item #{state.inspect} #{name.inspect}>"
  end

  private

  attr_reader :li
end

module KnowsTheUI
  def list
    all("li").map { |li| Item.new(li) }
  end

  def get_an_empty_task_list
    visit("/")
    click_button("Clear list")
  end

  def add_item(name)
    click_button("Add item")
    fill_in(with: name)
    click_button("Add")
    last_item_mentioned(list.last)
  end

  def get_item_by_name(name)
    items = list.select { |item| item.name == name }
    expect(items.length).to eq(1)
    last_item_mentioned(items[0])
  end

  def last_item_mentioned(item = :unset)
    @last_item_mentioned = item unless item == :unset
    @last_item_mentioned
  end

  def item_on_list?(item)
    last_item_mentioned(item)
    list.any? { |i| i.name == item.name }
  end

  def dismiss_item(item)
    last_item_mentioned(item)
    pending
  end

  def complete_the_item!
    # last_item_mentioned.complete!
    pending
  end

  def daily_reset!
    pending
  end

  def expect_order(order)
    expect(list.length).to eq order.length
    order.each_index do |i|
      expect(list[i].name).to eq order[i]
    end
  end

  def move_to_top(item)
    last_item_mentioned(item)
    pending
  end

  def move_to_bottom(item)
    last_item_mentioned(item)
    pending
  end

  def move_between(item, after: nil, before: nil)
    last_item_mentioned(item)
    pending
  end
end

World(KnowsTheUI)
