require 'tmpdir'
require 'fileutils'
root = File.expand_path('../../..', __dir__)
require File.join(root, 'modules/napplet-host/ios/NativeDependencyNotices')
source = File.join(root, 'modules/napplet-host/ios/Resources/notices')
HypergolicNativeDependencyNotices.verify(source)
cases = ['current original notices pass']
Dir.mktmpdir('hypergolic-native-notices-') do |directory|
  FileUtils.cp_r(File.join(source, '.'), directory)
  file = File.join(directory, 'libdav1d-COPYING.txt')
  original = File.binread(file)
  File.binwrite(file, original.sub('VideoLAN', 'Changed!'))
  begin
    HypergolicNativeDependencyNotices.verify(directory)
    raise 'Changed attribution was admitted'
  rescue RuntimeError => error
    raise unless error.message.include?('Native notice bytes changed')
  end
  cases << 'same-length attribution change rejects'
  File.binwrite(file, original)
  File.delete(File.join(directory, 'libdav1d-PATENTS.txt'))
  begin
    HypergolicNativeDependencyNotices.verify(directory)
    raise 'Missing patent notice was admitted'
  rescue RuntimeError => error
    raise unless error.message.include?('Native notice files changed')
  end
  cases << 'missing patent original rejects'
end
puts JSON.generate({ status: 'passed', cases: cases, temporaryFixturesRemoved: true })
