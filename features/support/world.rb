class Item
  attr_reader :name

  def initialize(name)
    @name = name
    @is_complete = false
    @is_optional = false
  end

  def state
    if @is_complete
      :complete
    elsif @is_optional
      :optional
    else
      :due
    end
  end

  def complete!
    @is_complete = true
  end

  def inspect
    "<Item #{state.inspect} #{name.inspect}>"
  end
end

class List
  def initialize
    @items = []
    @dismissed = {}
  end

  def visible
    items.reject { |i| @dismissed.has_key?(i) }
  end

  def empty?
    visible.empty?
  end

  def length
    visible.length
  end

  def [](i)
    visible[i]
  end

  def get_by_name(name)
    visible.find { |i| i.name == name }
  end

  def include?(item)
    visible.include?(item)
  end

  def add(item)
    items << item
  end

  def dismiss(item)
    @dismissed[item] = true
  end

  def reset!
    items.reject! { |i| i.state == :complete }
    @dismissed = {}
  end

  def move_to_top(item)
    items.reject! { |i| i.equal? item }
    items.unshift(item)
  end

  def move_to_bottom(item)
    items.reject! { |i| i.equal? item }
    items.push(item)
  end

  def move_between(item, after: nil, before: nil)
    items.reject! { |i| i.equal? item }

    # First, try to move it after the item called `after`. If `after` is
    # nil or not on the list, then try to move the item before `before`.
    # If `before` too is nil or not on the list, just move the item to
    # the end of the list.
    if after.nil? || items.index(after).nil?
      if before.nil? || items.index(before).nil?
        items.push(item)
      else
        items.insert(items.index(before), item)
      end
    else
      items.insert(items.index(before) + 1, item)
    end
  end

  def inspect
    "<List #{visible.inspect}>"
  end

  private

  attr_reader :items
end

module KnowsTheUI
  attr_reader :list

  def get_an_empty_task_list
    @list = List.new
  end

  def add_item(name)
    item = Item.new(name)
    list.add(item)
    last_item_mentioned(item)
  end

  def get_item_by_name(name)
    last_item_mentioned(list.get_by_name(name))
  end

  def last_item_mentioned(item = :unset)
    @last_item_mentioned = item unless item == :unset
    @last_item_mentioned
  end

  def item_on_list?(item)
    last_item_mentioned(item)
    list.include?(item)
  end

  def dismiss_item(item)
    last_item_mentioned(item)
    list.dismiss(item)
  end

  def complete_the_item!
    last_item_mentioned.complete!
  end

  def daily_reset!
    list.reset!
  end

  def expect_order(order)
    expect(list.length).to eq order.length
    order.each_index do |i|
      expect(list[i].name).to eq order[i]
    end
  end

  def move_to_top(item)
    last_item_mentioned(item)
    list.move_to_top(item)
  end

  def move_to_bottom(item)
    last_item_mentioned(item)
    list.move_to_bottom(item)
  end

  def move_between(item, after: nil, before: nil)
    last_item_mentioned(item)
    list.move_between(item, after: nil, before: before)
  end
end

World(KnowsTheUI)
