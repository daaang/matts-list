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

ParameterType(
  name: "is_logged_in",
  regexp: /( when I'm logged (in|out))?/,
  type: Symbol,
  transformer: lambda do |s|
    case s
    when " when I'm logged in"
      :login
    when " when I'm logged out"
      :logout
    else
      :none
    end
  end
)
