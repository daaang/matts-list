ParameterType(
  name: "item_phase",
  regexp: /due|optional|complete/,
  type: Symbol,
  transformer: ->(s) { s.to_sym }
)

ParameterType(
  name: "item_order",
  regexp: /.+/,
  type: Array,
  transformer: lambda do |s|
    s.split(", ").tap do |order|
      order.push(order.pop.sub(/^and /, ""))
    end
  end
)

ParameterType(
  name: "item_name",
  regexp: /.+/,
  type: String,
  transformer: ->(s) { s.to_s }
)
